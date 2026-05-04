/**
 * Migrate wrongly created heritage pages from pages/ root to pages/heritage/articles/
 * 
 * This script moves:
 * - pages/cultureArtAndCrafts -> pages/heritage/articles/arts-crafts (merging/updating)
 * - pages/culturePage -> pages/heritage/articles/culture (or appropriate ID)
 * 
 * Target structure follows sitewide standards:
 * - pages/heritage/articles/{article-id} (page metadata)
 * - pages/heritage/articles/{article-id}/sections (subcollection)
 */

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

dotenv.config();

const cwd = process.cwd();

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadServiceAccount() {
  const candidates = [
    path.resolve(cwd, '.secrets/serviceAccountKey.json'),
    path.resolve(cwd, '.secrets/service-account.json'),
    process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? path.resolve(cwd, process.env.GOOGLE_APPLICATION_CREDENTIALS)
      : null,
    path.resolve(cwd, 'serviceAccountKey.json'),
    path.resolve(cwd, 'service-account.json')
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        const data = readJson(candidate);
        if (typeof data.private_key === 'string' && data.private_key.includes('\\n')) {
          data.private_key = data.private_key.replace(/\\n/g, '\n');
        }
        return data;
      }
    } catch (error) {
      // Try next candidate
    }
  }

  const jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (typeof data.private_key === 'string' && data.private_key.includes('\\n')) {
        data.private_key = data.private_key.replace(/\\n/g, '\n');
      }
      return data;
    } catch (error) {
      // ignore
    }
  }

  return null;
}

const serviceAccount = loadServiceAccount();
if (!serviceAccount) {
  console.error('[migrate] No service account found.');
  console.error('[migrate] Place serviceAccountKey.json in .secrets/ or set GOOGLE_APPLICATION_CREDENTIALS.');
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
  });
}

const db = getFirestore();
const now = FieldValue.serverTimestamp();

/**
 * Migrate a document from source path to destination path
 * Handles both the main document and its sections subcollection
 */
async function migrateDocument(sourcePath, destPath, options = {}) {
  const { 
    transformData = null, 
    dryRun = false,
    skipIfDestExists = false,
    mergeSections = false
  } = options;

  console.log(`\n📦 Migrating: ${sourcePath} -> ${destPath}`);
  
  if (dryRun) {
    console.log('  [DRY RUN] Would migrate document');
  }

  const sourceRef = db.doc(sourcePath);
  const destRef = db.doc(destPath);

  // Check if source exists
  const sourceSnap = await sourceRef.get();
  if (!sourceSnap.exists) {
    console.log(`  ⚠️ Source document does not exist: ${sourcePath}`);
    return { success: false, reason: 'source_not_found' };
  }

  // Check if destination exists
  const destSnap = await destRef.get();
  if (destSnap.exists && skipIfDestExists) {
    console.log(`  ⏭️ Destination already exists, skipping: ${destPath}`);
    return { success: false, reason: 'dest_exists' };
  }

  let sourceData = sourceSnap.data();
  console.log(`  📄 Source data keys: ${Object.keys(sourceData).join(', ')}`);

  // Transform data if transform function provided
  if (transformData) {
    sourceData = transformData(sourceData);
    console.log(`  🔄 Transformed data keys: ${Object.keys(sourceData).join(', ')}`);
  }

  // Ensure updatedAt is set
  sourceData.updatedAt = now;
  if (!sourceData.createdAt) {
    sourceData.createdAt = now;
  }

  if (!dryRun) {
    // Write to destination
    if (destSnap.exists && mergeSections) {
      // Merge with existing
      await destRef.update(sourceData);
      console.log(`  ✅ Updated existing document: ${destPath}`);
    } else {
      // Create new
      await destRef.set(sourceData);
      console.log(`  ✅ Created document: ${destPath}`);
    }
  } else {
    console.log(`  [DRY RUN] Would write document to: ${destPath}`);
  }

  // Migrate sections subcollection
  const sectionsResult = await migrateSubcollection(
    `${sourcePath}/sections`,
    `${destPath}/sections`,
    { dryRun, merge: mergeSections && destSnap.exists }
  );

  return {
    success: true,
    sectionsMigrated: sectionsResult.count,
    data: sourceData
  };
}

/**
 * Migrate a subcollection from source to destination
 */
async function migrateSubcollection(sourcePath, destPath, options = {}) {
  const { dryRun = false, merge = false } = options;
  
  console.log(`  📂 Checking subcollection: ${sourcePath}`);
  
  const sourceSnaps = await db.collection(sourcePath).get();
  
  if (sourceSnaps.empty) {
    console.log(`  ℹ️ No sections in subcollection`);
    return { count: 0 };
  }

  console.log(`  📊 Found ${sourceSnaps.docs.length} sections to migrate`);

  if (dryRun) {
    return { count: sourceSnaps.docs.length };
  }

  let migratedCount = 0;
  const batch = db.batch();
  const destCollection = db.collection(destPath);

  for (const doc of sourceSnaps.docs) {
    const data = doc.data();
    data.updatedAt = now;
    if (!data.createdAt) {
      data.createdAt = now;
    }

    const destDocRef = destCollection.doc(doc.id);
    
    if (merge) {
      const destDoc = await destDocRef.get();
      if (destDoc.exists) {
        batch.update(destDocRef, data);
      } else {
        batch.set(destDocRef, data);
      }
    } else {
      batch.set(destDocRef, data);
    }
    
    migratedCount++;
  }

  await batch.commit();
  console.log(`  ✅ Migrated ${migratedCount} sections`);
  
  return { count: migratedCount };
}

/**
 * Transform cultureArtAndCrafts data to match arts-crafts standard
 */
function transformCultureArtAndCrafts(data) {
  console.log('  🔄 Transforming cultureArtAndCrafts -> arts-crafts format');
  
  return {
    id: 'arts-crafts',
    mainTitle: data.mainTitle || 'Arts, Crafts & Material Culture',
    headerDescription: data.headerDescription || 'Kazakh material culture reflects the resources of the steppe.',
    heroKicker: data.heroKicker || 'Crafted Heritage',
    location: data.location || 'Kazakhstan',
    articleViews: data.articleViews || 0,
    articleLikes: data.articleLikes || 0,
    articleComments: data.articleComments || 0,
    headerBackgroundPublicId: data.headerBackgroundPublicId || 'content/pages/heritage/arts-crafts/hero',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Culture', href: '/culture' },
      { label: 'Arts & Crafts' }
    ],
    seo: {
      title: data.seo?.title || 'Arts, Crafts & Material Culture | Culture | VeryNice',
      description: data.seo?.description || 'Discover Kazakh traditional arts and crafts.'
    },
    updatedAt: now,
    createdAt: data.createdAt || now
  };
}

/**
 * Transform culturePage data to match heritage articles standard
 */
function transformCulturePage(data) {
  console.log('  🔄 Transforming culturePage -> heritage culture article format');
  
  return {
    id: 'culture',
    mainTitle: data.mainTitle || 'Kazakh Culture',
    headerDescription: data.headerDescription || 'Discover the rich cultural heritage of Kazakhstan.',
    heroKicker: data.heroKicker || 'Living Traditions',
    location: data.location || 'Kazakhstan',
    articleViews: data.articleViews || 0,
    articleLikes: data.articleLikes || 0,
    articleComments: data.articleComments || 0,
    headerBackgroundPublicId: data.headerBackgroundPublicId || 'content/pages/heritage/culture/hero',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Culture', href: '/culture' },
      { label: 'Culture' }
    ],
    seo: {
      title: data.seo?.title || 'Kazakh Culture | VeryNice',
      description: data.seo?.description || 'Explore the rich cultural traditions of Kazakhstan.'
    },
    updatedAt: now,
    createdAt: data.createdAt || now
  };
}

/**
 * Delete source documents after successful migration
 */
async function deleteSourceDocuments(paths, dryRun = false) {
  console.log('\n🗑️ Deleting source documents...');
  
  for (const path of paths) {
    console.log(`  🗑️ ${path}`);
    
    if (!dryRun) {
      try {
        // Delete sections first
        const sectionsSnap = await db.collection(`${path}/sections`).get();
        if (!sectionsSnap.empty) {
          const batch = db.batch();
          for (const doc of sectionsSnap.docs) {
            batch.delete(doc.ref);
          }
          await batch.commit();
          console.log(`    ✅ Deleted ${sectionsSnap.docs.length} sections`);
        }
        
        // Delete main document
        await db.doc(path).delete();
        console.log(`    ✅ Deleted document`);
      } catch (error) {
        console.error(`    ❌ Error deleting: ${error.message}`);
      }
    } else {
      console.log(`    [DRY RUN] Would delete`);
    }
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  const dryRun = process.argv.includes('--dry-run');
  const deleteSources = process.argv.includes('--delete-sources');
  
  console.log('='.repeat(60));
  console.log('Heritage Pages Migration');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Delete sources: ${deleteSources ? 'YES' : 'NO (add --delete-sources to remove)'}`);
  console.log('');

  const migratedPaths = [];
  const results = [];

  // Migration 1: cultureArtAndCrafts -> pages/heritage/articles/arts-crafts
  try {
    const result1 = await migrateDocument(
      'pages/cultureArtAndCrafts',
      'pages/heritage/articles/arts-crafts',
      {
        transformData: transformCultureArtAndCrafts,
        dryRun,
        skipIfDestExists: false,
        mergeSections: true
      }
    );
    results.push({ source: 'cultureArtAndCrafts', ...result1 });
    if (result1.success) {
      migratedPaths.push('pages/cultureArtAndCrafts');
    }
  } catch (error) {
    console.error(`❌ Error migrating cultureArtAndCrafts: ${error.message}`);
    results.push({ source: 'cultureArtAndCrafts', success: false, error: error.message });
  }

  // Migration 2: culturePage -> pages/heritage/articles/culture
  try {
    const result2 = await migrateDocument(
      'pages/culturePage',
      'pages/heritage/articles/culture',
      {
        transformData: transformCulturePage,
        dryRun,
        skipIfDestExists: false,
        mergeSections: false
      }
    );
    results.push({ source: 'culturePage', ...result2 });
    if (result2.success) {
      migratedPaths.push('pages/culturePage');
    }
  } catch (error) {
    console.error(`❌ Error migrating culturePage: ${error.message}`);
    results.push({ source: 'culturePage', success: false, error: error.message });
  }

  // Delete sources if requested
  if (deleteSources && migratedPaths.length > 0) {
    await deleteSourceDocuments(migratedPaths, dryRun);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Migration Summary');
  console.log('='.repeat(60));
  
  for (const result of results) {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.source}: ${result.success ? 'Migrated' : result.reason || result.error}`);
    if (result.sectionsMigrated) {
      console.log(`   └─ Sections: ${result.sectionsMigrated}`);
    }
  }

  if (!deleteSources && migratedPaths.length > 0) {
    console.log('\n⚠️ Source documents were not deleted.');
    console.log('   Run with --delete-sources to remove them after verification.');
    console.log('   Sources to delete:');
    for (const path of migratedPaths) {
      console.log(`     - ${path}`);
    }
  }

  console.log('\n✅ Migration complete!');
  process.exit(0);
}

// Run migration
runMigration().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
