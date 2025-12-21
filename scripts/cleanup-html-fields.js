#!/usr/bin/env node
/**
 * Cleanup Script - Remove HTML fields after Markdown migration
 * Removes contentHTML fields from documents that have contentMarkdown
 * 
 * Usage: node scripts/cleanup-html-fields.js [options]
 * Options:
 *   --dry-run        Preview changes without applying them
 *   --force          Skip confirmation prompts
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

// Load Firebase service account
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

// Initialize Firebase Admin
function initFirebase() {
  if (getApps().length === 0) {
    const sa = loadServiceAccount();
    if (!sa) {
      throw new Error('Firebase service account not found. Place serviceAccountKey.json in .secrets/ directory.');
    }
    initializeApp({
      credential: cert(sa),
      projectId: sa.project_id
    });
  }
  return getFirestore();
}

// Cleanup collection
async function cleanupCollection(db, collectionPath, options = {}) {
  const { dryRun = false } = options;
  
  log(`\n📁 Cleaning up: ${collectionPath}`, 'cyan');
  
  const parts = collectionPath.split('/').filter(p => p.length > 0);
  let collectionRef;
  
  if (parts.length === 1) {
    collectionRef = db.collection(parts[0]);
  } else if (parts.length === 3) {
    collectionRef = db.doc(`${parts[0]}/${parts[1]}`).collection(parts[2]);
  } else {
    throw new Error(`Invalid collection path: ${collectionPath}`);
  }
  
  const snapshot = await collectionRef.get();
  const results = {
    total: snapshot.size,
    cleaned: 0,
    skipped: 0,
    errors: 0,
    documents: []
  };
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // Only clean if has contentMarkdown
    if (!data.contentMarkdown || data.contentMarkdown.trim().length === 0) {
      results.skipped++;
      results.documents.push({
        id: doc.id,
        skipped: true,
        reason: 'No contentMarkdown field'
      });
      continue;
    }
    
    // Check if has contentHTML to remove
    if (!data.contentHTML && !data.content) {
      results.skipped++;
      results.documents.push({
        id: doc.id,
        skipped: true,
        reason: 'No HTML fields to remove'
      });
      continue;
    }
    
    if (dryRun) {
      results.cleaned++;
      results.documents.push({
        id: doc.id,
        wouldRemove: {
          contentHTML: !!data.contentHTML,
          content: !!data.content
        }
      });
      log(`  📝 ${doc.id} - Would remove HTML fields`, 'yellow');
    } else {
      try {
        const updateData = {};
        if (data.contentHTML) {
          updateData.contentHTML = null; // Firestore delete
        }
        if (data.content && data.content === data.contentHTML) {
          updateData.content = null; // Firestore delete
        }
        
        await doc.ref.update(updateData);
        results.cleaned++;
        results.documents.push({
          id: doc.id,
          cleaned: true,
          removed: updateData
        });
        log(`  ✅ ${doc.id} - Removed HTML fields`, 'green');
      } catch (error) {
        results.errors++;
        results.documents.push({
          id: doc.id,
          error: error.message
        });
        log(`  ❌ ${doc.id} - Error: ${error.message}`, 'red');
      }
    }
  }
  
  return results;
}

// Main cleanup function
async function runCleanup(options = {}) {
  const { dryRun = false, force = false } = options;
  
  log('\n🧹 HTML Fields Cleanup', 'bold');
  log('='.repeat(50), 'cyan');
  
  if (dryRun) {
    log('⚠️  DRY RUN MODE - No changes will be made', 'yellow');
  } else {
    log('⚠️  WARNING: This will permanently remove HTML fields!', 'red');
    if (!force) {
      log('Press Ctrl+C to cancel, or wait 5 seconds to continue...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  try {
    const db = initFirebase();
    log('✅ Firebase Admin initialized', 'green');
    
    const cleanupResults = {
      timestamp: new Date().toISOString(),
      dryRun,
      collections: [],
      summary: {
        totalDocuments: 0,
        cleaned: 0,
        skipped: 0,
        errors: 0
      }
    };
    
    // Cleanup all sections
    log('\n📋 Finding sections to clean up...', 'blue');
    
    const pagesSnapshot = await db.collection('pages').get();
    for (const pageDoc of pagesSnapshot.docs) {
      const collectionPath = `pages/${pageDoc.id}/sections`;
      const result = await cleanupCollection(db, collectionPath, { dryRun });
      if (result.total > 0) {
        cleanupResults.collections.push({
          path: collectionPath,
          ...result
        });
      }
    }
    
    // Calculate summary
    cleanupResults.collections.forEach(col => {
      cleanupResults.summary.totalDocuments += col.total;
      cleanupResults.summary.cleaned += col.cleaned;
      cleanupResults.summary.skipped += col.skipped;
      cleanupResults.summary.errors += col.errors;
    });
    
    // Print summary
    log('\n' + '='.repeat(50), 'cyan');
    log('\n📊 Cleanup Summary', 'bold');
    log(`   Total documents: ${cleanupResults.summary.totalDocuments}`, 'cyan');
    log(`   Cleaned: ${cleanupResults.summary.cleaned}`, 'green');
    log(`   Skipped: ${cleanupResults.summary.skipped}`, 'yellow');
    log(`   Errors: ${cleanupResults.summary.errors}`, 
        cleanupResults.summary.errors > 0 ? 'red' : 'green');
    
    // Save report
    const reportFile = `cleanup-report-${Date.now()}.json`;
    writeFileSync(reportFile, JSON.stringify(cleanupResults, null, 2));
    log(`\n💾 Report saved to: ${reportFile}`, 'green');
    
    if (dryRun) {
      log('\n💡 Run without --dry-run to apply changes', 'yellow');
    }
    
  } catch (error) {
    log(`\n❌ Cleanup failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  force: args.includes('--force')
};

// Run cleanup
runCleanup(options).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});




































