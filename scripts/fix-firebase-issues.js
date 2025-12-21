#!/usr/bin/env node
/**
 * Fix Firebase Database Issues
 * - Removes duplicate author entries
 * - Ensures consistent naming
 * - Fixes missing required fields
 */

import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

async function fixAuthorDuplicates(db) {
  log('\n🔧 Fixing Author Duplicates', 'blue');
  
  const authorsRef = db.collection('authors');
  const snapshot = await authorsRef.get();
  
  // Find duplicates
  const authors = {};
  for (const doc of snapshot.docs) {
    const id = doc.id;
    const normalizedId = id.replace(/[-_]/g, '').toLowerCase();
    if (!authors[normalizedId]) {
      authors[normalizedId] = [];
    }
    authors[normalizedId].push({ id, doc, data: doc.data() });
  }
  
  // Fix duplicates - prefer hyphenated version (aliya-askar over aliya_askar)
  for (const [normalizedId, authorList] of Object.entries(authors)) {
    if (authorList.length > 1) {
      log(`  Found duplicate authors: ${authorList.map(a => a.id).join(', ')}`, 'yellow');
      
      // Sort: prefer hyphen over underscore
      authorList.sort((a, b) => {
        if (a.id.includes('-') && !b.id.includes('-')) return -1;
        if (!a.id.includes('-') && b.id.includes('-')) return 1;
        return a.id.localeCompare(b.id);
      });
      
      const primary = authorList[0];
      const duplicates = authorList.slice(1);
      
      log(`  Keeping: ${primary.id}`, 'green');
      
      // Merge data from duplicates into primary
      let mergedData = { ...primary.data };
      for (const dup of duplicates) {
        log(`  Merging data from: ${dup.id}`, 'cyan');
        // Merge fields, prefer primary but fill missing from duplicate
        for (const [key, value] of Object.entries(dup.data)) {
          if (!mergedData[key] || mergedData[key] === null || mergedData[key] === '') {
            if (value !== null && value !== undefined && value !== '') {
              mergedData[key] = value;
              log(`    Added missing field '${key}' from duplicate`, 'cyan');
            }
          }
        }
      }
      
      // Update primary with merged data
      await primary.doc.ref.update(mergedData);
      log(`  ✅ Updated primary author: ${primary.id}`, 'green');
      
      // Delete duplicates
      for (const dup of duplicates) {
        await dup.doc.ref.delete();
        log(`  🗑️  Deleted duplicate: ${dup.id}`, 'yellow');
      }
      
      // Update all page references to use primary ID
      const pagesRef = db.collection('pages');
      const pagesSnap = await pagesRef.get();
      
      for (const pageDoc of pagesSnap.docs) {
        const pageData = pageDoc.data();
        let updated = false;
        const updates = {};
        
        // Check authorId field
        if (pageData.authorId && duplicates.some(d => d.id === pageData.authorId)) {
          updates.authorId = primary.id;
          updated = true;
        }
        
        // Check author field (legacy)
        if (pageData.author && duplicates.some(d => d.id === pageData.author)) {
          updates.author = primary.id;
          updated = true;
        }
        
        if (updated) {
          await pageDoc.ref.update(updates);
          log(`  ✅ Updated page '${pageDoc.id}' to use author '${primary.id}'`, 'green');
        }
      }
    }
  }
}

async function ensureAuthorBio(db) {
  log('\n🔧 Ensuring Author Bio Fields', 'blue');
  
  const authorsRef = db.collection('authors');
  const snapshot = await authorsRef.get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = {};
    
    if (!data.bio || data.bio.trim().length === 0) {
      // Try to get bio from description or other fields
      const bio = data.description || data.biography || data.about || '';
      if (bio && bio.trim().length > 0) {
        updates.bio = bio;
        log(`  ✅ Added bio to author '${doc.id}' from description field`, 'green');
      } else {
        // Set a placeholder bio
        updates.bio = data.name ? `Author: ${data.name}` : 'Author bio';
        log(`  ⚠️  Added placeholder bio to author '${doc.id}'`, 'yellow');
      }
    }
    
    if (Object.keys(updates).length > 0) {
      await doc.ref.update(updates);
    }
  }
}

async function main() {
  log('\n🔧 Firebase Database Fix Script', 'bold');
  log('='.repeat(60), 'cyan');
  
  try {
    const db = initFirebase();
    log('✅ Firebase Admin initialized', 'green');
    
    await fixAuthorDuplicates(db);
    await ensureAuthorBio(db);
    
    log('\n' + '='.repeat(60), 'cyan');
    log('\n✅ All fixes applied!', 'green');
    log('💡 Run comprehensive audit again to verify', 'cyan');
    
  } catch (error) {
    log(`\n❌ Fix failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();




































