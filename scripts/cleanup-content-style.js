#!/usr/bin/env node
/**
 * Content Style Cleanup Script
 * Makes content read more naturally and human-written:
 * - Removes markdown heading syntax (###, ##, #)
 * - Removes color codes (#8B4513)
 * - Removes citation patterns (cite[])
 * - Converts bold (**text**) to italic (*text*) for more natural feel
 * - Cleans up formatting to be more readable
 * 
 * Usage: node scripts/cleanup-content-style.js [options]
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

// Clean up content to be more natural and human-written
function cleanupContent(text) {
  if (!text || typeof text !== 'string') return text;
  
  let cleaned = text;
  
  // 1. Remove markdown heading syntax (###, ##, #) - anywhere in text
  // Convert headings to plain text (more natural, less AI-like)
  cleaned = cleaned
    .replace(/####\s+/g, '')         // #### Heading -> Heading (anywhere)
    .replace(/###\s+/g, '')           // ### Heading -> Heading (anywhere)
    .replace(/##\s+/g, '')            // ## Heading -> Heading (anywhere)
    .replace(/(?<!\*)#\s+/g, '');     // # Heading -> Heading (but not *#
  
  // 2. Remove color codes like (#8B4513), (#000000), etc.
  cleaned = cleaned
    .replace(/\(#[\da-fA-F]{6}\)/g, '')      // (#8B4513)
    .replace(/\(#[\da-fA-F]{3}\)/g, '')      // (#000)
    .replace(/\(#[0-9a-fA-F]{8}\)/g, '');    // (#8B4513FF) with alpha
  
  // 3. Remove citation patterns (cite[1], cite[2], etc.)
  cleaned = cleaned
    .replace(/:\s*cite\\?\[[^\]]+\]/gi, '')  // :cite[1] or :cite\[1\]
    .replace(/cite\\?\[[^\]]+\]/gi, '');     // cite[1] standalone
  
  // 4. Convert bold (**text**) to italic (*text*) for more natural feel
  // But preserve structure - convert **bold** to *italic*
  cleaned = cleaned
    .replace(/\*\*([^*]+)\*\*/g, '*$1*');    // **bold** -> *italic*
  
  // 5. Clean up formatting for natural flow
  cleaned = cleaned
    // Remove excessive asterisks (more than 2 consecutive)
    .replace(/\*{3,}/g, '**')
    // Clean up spacing around formatting
    .replace(/\s+\*/g, ' *')                 // Space before asterisk
    .replace(/\*\s+/g, '* ')                  // Space after asterisk
    // Remove backslash escapes that are no longer needed
    .replace(/\\-/g, '-')                    // \- -> -
    .replace(/\\\./g, '.')                   // \. -> .
    // Clean up list formatting (remove backslashes before dashes)
    .replace(/\\-/g, '-')
    // Clean up excessive blank lines
    .replace(/\n{3,}/g, '\n\n')              // Max 2 blank lines
    // Clean up spaces
    .replace(/[ \t]+/g, ' ')                 // Multiple spaces to single
    .replace(/\n[ \t]+/g, '\n')             // Remove leading spaces on lines
    .replace(/[ \t]+\n/g, '\n')             // Remove trailing spaces
    .trim();
  
  return cleaned;
}

// Process document
async function processDocument(docRef, data, dryRun = false) {
  const contentMarkdown = data.contentMarkdown || '';
  
  if (!contentMarkdown || typeof contentMarkdown !== 'string' || contentMarkdown.trim().length === 0) {
    return { skipped: true, reason: 'No contentMarkdown found' };
  }
  
  // Clean up content
  const cleaned = cleanupContent(contentMarkdown);
  
  if (cleaned === contentMarkdown) {
    return { skipped: true, reason: 'No changes needed' };
  }
  
  if (dryRun) {
    return {
      skipped: false,
      dryRun: true,
      cleaned,
      originalLength: contentMarkdown.length,
      cleanedLength: cleaned.length,
      wouldUpdate: {
        contentMarkdown: cleaned
      }
    };
  }
  
  // Update document
  try {
    await docRef.update({
      contentMarkdown: cleaned
    });
    
    return {
      skipped: false,
      cleaned: true,
      cleaned,
      originalLength: contentMarkdown.length,
      cleanedLength: cleaned.length
    };
  } catch (error) {
    return {
      skipped: false,
      error: error.message
    };
  }
}

// Process collection
async function processCollection(db, collectionPath, options = {}) {
  const { dryRun = false } = options;
  
  log(`\n📁 Processing: ${collectionPath}`, 'cyan');
  
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
    processed: 0,
    skipped: 0,
    errors: 0,
    documents: []
  };
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const result = await processDocument(doc.ref, data, dryRun);
    
    results.documents.push({
      id: doc.id,
      path: doc.ref.path,
      ...result
    });
    
    if (result.cleaned) {
      results.processed++;
      log(`  ✅ ${doc.id}`, 'green');
    } else if (result.error) {
      results.errors++;
      log(`  ❌ ${doc.id}: ${result.error}`, 'red');
    } else if (result.skipped) {
      results.skipped++;
      if (result.reason !== 'No contentMarkdown found') {
        log(`  ⏭️  ${doc.id}: ${result.reason}`, 'yellow');
      }
    }
  }
  
  return results;
}

// Main function
async function runCleanup(options = {}) {
  const { dryRun = false, force = false } = options;
  
  log('\n✏️  Content Style Cleanup', 'bold');
  log('Making content more natural and human-written...', 'cyan');
  log('='.repeat(50), 'cyan');
  
  if (dryRun) {
    log('⚠️  DRY RUN MODE - No changes will be made', 'yellow');
  } else {
    log('⚠️  WARNING: This will modify your Firebase database!', 'red');
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
        processed: 0,
        skipped: 0,
        errors: 0
      }
    };
    
    // Process all sections
    log('\n📋 Finding all sections...', 'blue');
    
    const pagesSnapshot = await db.collection('pages').get();
    for (const pageDoc of pagesSnapshot.docs) {
      const collectionPath = `pages/${pageDoc.id}/sections`;
      const result = await processCollection(db, collectionPath, { dryRun });
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
      cleanupResults.summary.processed += col.processed;
      cleanupResults.summary.skipped += col.skipped;
      cleanupResults.summary.errors += col.errors;
    });
    
    // Print summary
    log('\n' + '='.repeat(50), 'cyan');
    log('\n📊 Cleanup Summary', 'bold');
    log(`   Total documents: ${cleanupResults.summary.totalDocuments}`, 'cyan');
    log(`   Processed: ${cleanupResults.summary.processed}`, 'green');
    log(`   Skipped: ${cleanupResults.summary.skipped}`, 'yellow');
    log(`   Errors: ${cleanupResults.summary.errors}`, 
        cleanupResults.summary.errors > 0 ? 'red' : 'green');
    
    // Save report
    const reportFile = `content-cleanup-report-${Date.now()}.json`;
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

