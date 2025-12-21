#!/usr/bin/env node
/**
 * Upgrade Firebase Database Structure
 * Implements best practices and ensures consistency across all collections
 * 
 * Improvements:
 * - Adds missing required fields
 * - Normalizes field names
 * - Adds metadata (createdAt, updatedAt)
 * - Ensures proper ordering
 * - Adds contentFormat where missing
 * - Standardizes structure across documents
 */

import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadServiceAccount() {
  const secretsPaths = [
    resolve('.secrets/serviceAccountKey.json'),
    resolve('.secrets/service-account.json'),
    resolve('serviceAccountKey.json'),
    resolve('service-account.json')
  ];

  for (const path of secretsPaths) {
    try {
      if (existsSync(path)) {
        const sa = JSON.parse(readFileSync(path, 'utf8'));
        if (typeof sa.private_key === 'string' && sa.private_key.includes('\\n')) {
          sa.private_key = sa.private_key.replace(/\\n/g, '\n');
        }
        return sa;
      }
    } catch (error) {
      // Continue
    }
  }
  return null;
}

function initFirebase() {
  if (getApps().length === 0) {
    const sa = loadServiceAccount();
    if (!sa) {
      throw new Error('Firebase service account not found.');
    }
    initializeApp({
      credential: cert(sa),
      projectId: sa.project_id
    });
  }
  return getFirestore();
}

async function upgradePages(db) {
  log('\n📄 Upgrading Pages Collection', 'blue');
  const pagesRef = db.collection('pages');
  const snapshot = await pagesRef.get();
  
  let updated = 0;
  const now = Timestamp.now();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = {};
    let hasUpdates = false;
    
    // Add metadata
    if (!data.createdAt) {
      updates.createdAt = data.createdAt || now;
      hasUpdates = true;
    }
    updates.updatedAt = now;
    hasUpdates = true;
    
    // Ensure authorId is set (for historyPage)
    if (doc.id === 'historyPage' && !data.authorId) {
      updates.authorId = 'aliya-askar';
      hasUpdates = true;
      log(`  ✅ Added authorId to ${doc.id}`, 'green');
    }
    
    // Normalize title field
    if (!data.title && (data.pageTitle || data.name)) {
      updates.title = data.pageTitle || data.name;
      hasUpdates = true;
    }
    
    // Add metaDescription if missing
    if (!data.metaDescription && data.description) {
      updates.metaDescription = data.description;
      hasUpdates = true;
    }
    
    // Ensure proper structure
    if (hasUpdates) {
      await doc.ref.update(updates);
      updated++;
      log(`  ✅ Updated page: ${doc.id}`, 'green');
    }
  }
  
  log(`  📊 Updated ${updated} pages`, 'cyan');
  return updated;
}

async function upgradeSections(db) {
  log('\n📑 Upgrading Sections Subcollections', 'blue');
  const pagesRef = db.collection('pages');
  const pagesSnap = await pagesRef.get();
  
  let totalUpdated = 0;
  const now = Timestamp.now();
  
  for (const pageDoc of pagesSnap.docs) {
    const sectionsRef = pageDoc.ref.collection('sections');
    const sectionsSnap = await sectionsRef.get();
    
    if (sectionsSnap.empty) continue;
    
    log(`  📁 Processing sections for: ${pageDoc.id}`, 'cyan');
    let updated = 0;
    
    for (const sectionDoc of sectionsSnap.docs) {
      const data = sectionDoc.data();
      const updates = {};
      let hasUpdates = false;
      
      // Add metadata
      if (!data.createdAt) {
        updates.createdAt = data.createdAt || now;
        hasUpdates = true;
      }
      updates.updatedAt = now;
      hasUpdates = true;
      
      // Ensure sectionId field (for navigation)
      if (!data.sectionId) {
        updates.sectionId = sectionDoc.id;
        hasUpdates = true;
      }
      
      // Ensure title field exists
      if (!data.title) {
        const title = data.name || data.heading || data.sectionTitle || `Section ${sectionDoc.id}`;
        updates.title = title;
        hasUpdates = true;
        log(`    ✅ Added title to section: ${sectionDoc.id}`, 'green');
      }
      
      // Ensure order field (numeric)
      if (data.order === undefined || data.order === null) {
        // Try to extract order from ID or use index
        const orderMatch = sectionDoc.id.match(/order-?(\d+)/i);
        updates.order = orderMatch ? parseInt(orderMatch[1]) : 0;
        hasUpdates = true;
      } else if (typeof data.order !== 'number') {
        updates.order = parseInt(data.order) || 0;
        hasUpdates = true;
      }
      
      // Ensure contentFormat field
      const hasMarkdown = !!(data.contentMarkdown && data.contentMarkdown.trim().length > 0);
      const hasHTML = !!(data.contentHTML && data.contentHTML.trim().length > 0);
      
      if (!data.contentFormat) {
        if (hasMarkdown) {
          updates.contentFormat = 'markdown';
        } else if (hasHTML) {
          updates.contentFormat = 'html';
        } else {
          updates.contentFormat = 'auto';
        }
        hasUpdates = true;
      }
      
      // Ensure contentMarkdown exists (even if empty)
      if (!('contentMarkdown' in data)) {
        updates.contentMarkdown = data.contentMarkdown || '';
        hasUpdates = true;
      }
      
      // Ensure contentHTML exists (for backward compatibility)
      if (!('contentHTML' in data) && data.content) {
        updates.contentHTML = data.content;
        hasUpdates = true;
      }
      
      // Normalize images array
      if (!Array.isArray(data.images)) {
        if (data.image) {
          updates.images = Array.isArray(data.image) ? data.image : [data.image];
        } else {
          updates.images = [];
        }
        hasUpdates = true;
      }
      
      // Add quality metadata
      if (!data._quality) {
        updates._quality = {
          hasTitle: !!(data.title || updates.title),
          hasContent: !!(hasMarkdown || hasHTML),
          contentLength: (data.contentMarkdown || data.contentHTML || '').length,
          contentFormat: updates.contentFormat || data.contentFormat || 'auto',
          imageCount: Array.isArray(data.images) ? data.images.length : 0,
          imagesWithAltText: Array.isArray(data.images) 
            ? data.images.filter(img => img && img.alt && img.alt.trim().length >= 3).length 
            : 0
        };
        hasUpdates = true;
      }
      
      if (hasUpdates) {
        await sectionDoc.ref.update(updates);
        updated++;
        log(`    ✅ Updated section: ${sectionDoc.id}`, 'green');
      }
    }
    
    totalUpdated += updated;
    log(`  📊 Updated ${updated} sections in ${pageDoc.id}`, 'cyan');
  }
  
  log(`  📊 Total sections updated: ${totalUpdated}`, 'cyan');
  return totalUpdated;
}

async function upgradeAuthors(db) {
  log('\n👤 Upgrading Authors Collection', 'blue');
  const authorsRef = db.collection('authors');
  const snapshot = await authorsRef.get();
  
  let updated = 0;
  const now = Timestamp.now();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = {};
    let hasUpdates = false;
    
    // Add metadata
    if (!data.createdAt) {
      updates.createdAt = data.createdAt || now;
      hasUpdates = true;
    }
    updates.updatedAt = now;
    hasUpdates = true;
    
    // Ensure required fields
    if (!data.name) {
      updates.name = data.authorName || 'Unknown Author';
      hasUpdates = true;
    }
    
    if (!data.bio) {
      updates.bio = data.description || data.biography || data.about || 'Author bio';
      hasUpdates = true;
    }
    
    // Normalize image fields
    const imagePublicId = data.profilePicturePublicId || 
                         data.authorImagePublicId || 
                         data.avatarPublicId || 
                         data.avatarUrl || 
                         null;
    
    if (imagePublicId) {
      // Ensure all image field variants are set
      if (!data.profilePicturePublicId) {
        updates.profilePicturePublicId = imagePublicId;
        hasUpdates = true;
      }
      if (!data.authorImagePublicId) {
        updates.authorImagePublicId = imagePublicId;
        hasUpdates = true;
      }
      if (!data.avatarPublicId) {
        updates.avatarPublicId = imagePublicId;
        hasUpdates = true;
      }
    }
    
    // Ensure description field
    if (!data.description && data.bio) {
      updates.description = data.bio;
      hasUpdates = true;
    }
    
    if (hasUpdates) {
      await doc.ref.update(updates);
      updated++;
      log(`  ✅ Updated author: ${doc.id}`, 'green');
    }
  }
  
  log(`  📊 Updated ${updated} authors`, 'cyan');
  return updated;
}

async function upgradeAttractions(db) {
  log('\n🏛️  Upgrading Attractions Collection', 'blue');
  const attractionsRef = db.collection('attractions');
  const snapshot = await attractionsRef.get();
  
  let updated = 0;
  const now = Timestamp.now();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = {};
    let hasUpdates = false;
    
    // Add metadata
    if (!data.createdAt) {
      updates.createdAt = data.createdAt || now;
      hasUpdates = true;
    }
    updates.updatedAt = now;
    hasUpdates = true;
    
    // Ensure order field
    if (data.order === undefined || data.order === null) {
      updates.order = 0;
      hasUpdates = true;
    } else if (typeof data.order !== 'number') {
      updates.order = parseInt(data.order) || 0;
      hasUpdates = true;
    }
    
    if (hasUpdates) {
      await doc.ref.update(updates);
      updated++;
    }
  }
  
  log(`  📊 Updated ${updated} attractions`, 'cyan');
  return updated;
}

async function upgradeTips(db) {
  log('\n💡 Upgrading Tips Collection', 'blue');
  const tipsRef = db.collection('tips');
  const snapshot = await tipsRef.get();
  
  let updated = 0;
  const now = Timestamp.now();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = {};
    let hasUpdates = false;
    
    // Add metadata
    if (!data.createdAt) {
      updates.createdAt = data.createdAt || now;
      hasUpdates = true;
    }
    updates.updatedAt = now;
    hasUpdates = true;
    
    // Ensure order field
    if (data.order === undefined || data.order === null) {
      updates.order = 0;
      hasUpdates = true;
    } else if (typeof data.order !== 'number') {
      updates.order = parseInt(data.order) || 0;
      hasUpdates = true;
    }
    
    if (hasUpdates) {
      await doc.ref.update(updates);
      updated++;
    }
  }
  
  log(`  📊 Updated ${updated} tips`, 'cyan');
  return updated;
}

async function main() {
  log('\n🚀 Firebase Database Structure Upgrade', 'bold');
  log('Implementing best practices and ensuring consistency...', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  if (dryRun) {
    log('⚠️  DRY RUN MODE - No changes will be made', 'yellow');
  } else {
    log('⚠️  WARNING: This will modify your Firebase database!', 'red');
    log('Press Ctrl+C to cancel, or wait 5 seconds to continue...', 'yellow');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  try {
    const db = initFirebase();
    log('✅ Firebase Admin initialized', 'green');
    
    const results = {
      pages: 0,
      sections: 0,
      authors: 0,
      attractions: 0,
      tips: 0
    };
    
    if (!dryRun) {
      results.pages = await upgradePages(db);
      results.sections = await upgradeSections(db);
      results.authors = await upgradeAuthors(db);
      results.attractions = await upgradeAttractions(db);
      results.tips = await upgradeTips(db);
    }
    
    log('\n' + '='.repeat(60), 'cyan');
    log('\n📊 Upgrade Summary', 'bold');
    log(`   Pages updated: ${results.pages}`, 'cyan');
    log(`   Sections updated: ${results.sections}`, 'cyan');
    log(`   Authors updated: ${results.authors}`, 'cyan');
    log(`   Attractions updated: ${results.attractions}`, 'cyan');
    log(`   Tips updated: ${results.tips}`, 'cyan');
    
    const total = Object.values(results).reduce((a, b) => a + b, 0);
    log(`\n   Total documents updated: ${total}`, 'green');
    
    if (dryRun) {
      log('\n💡 Run without --dry-run to apply changes', 'yellow');
    } else {
      log('\n✅ Database upgrade complete!', 'green');
    }
    
  } catch (error) {
    log(`\n❌ Upgrade failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();




































