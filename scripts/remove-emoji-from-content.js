#!/usr/bin/env node
/**
 * Remove Emojis and Icons from Content Script
 * Removes emoji characters and common icon patterns from Firebase content
 * 
 * Usage: node scripts/remove-emoji-from-content.js [options]
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

// Remove emojis and icons from text
function removeEmojis(text) {
  if (!text || typeof text !== 'string') return text;
  
  // Remove emoji characters (Unicode ranges for emojis)
  // This covers most emoji ranges
  let cleaned = text
    // Remove emoji ranges
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Miscellaneous Symbols and Pictographs
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map Symbols
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Miscellaneous Symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
    .replace(/[\u{1FA00}-\u{1FAFF}]/gu, '') // Chess Symbols
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
    .replace(/[\u{200D}]/gu, '')            // Zero Width Joiner
    .replace(/[\u{FE0F}]/gu, '')            // Variation Selector-16
    .replace(/[\u{20E3}]/gu, '')            // Combining Enclosing Keycap
    // Remove citation patterns (like :cite[1], :cite[2], etc.)
    .replace(/:\s*cite\\?\[[^\]]+\]/gi, '')
    // Remove standalone emoji-like patterns (explicit list)
    .replace(/[🔬🌍⚔️🏹🕌🐫🌠🐎⚒️🎨🌐💔✅❌⚠️📁📋💾🔍🔄🧹]/g, '')
    // Clean up spaces around removed emojis (before and after)
    .replace(/\s+([*])/g, '$1')  // Remove space before asterisk
    .replace(/([*])\s+/g, '$1')  // Remove space after asterisk (if followed by space)
    .replace(/\*\*\s+/g, '**')   // Remove space after **
    .replace(/\s+\*\*/g, '**')   // Remove space before **
    // Clean up extra spaces left by removals
    .replace(/[ \t]+/g, ' ')      // Multiple spaces/tabs to single space
    .replace(/\n[ \t]+/g, '\n')   // Remove leading spaces on lines
    .replace(/[ \t]+\n/g, '\n')   // Remove trailing spaces on lines
    .replace(/\n{3,}/g, '\n\n')   // Remove excessive blank lines (more than 2)
    .trim();
  
  return cleaned;
}

// Process document
async function processDocument(docRef, data, dryRun = false) {
  const contentMarkdown = data.contentMarkdown || '';
  
  if (!contentMarkdown || typeof contentMarkdown !== 'string' || contentMarkdown.trim().length === 0) {
    return { skipped: true, reason: 'No contentMarkdown found' };
  }
  
  // Check if content has emojis
  const hasEmojis = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(contentMarkdown) ||
                    /[🔬🌍⚔️🏹🕌🐫🌠🐎⚒️🎨🌐💔✅❌⚠️📁📋💾🔍🔄🧹]/g.test(contentMarkdown);
  
  if (!hasEmojis) {
    return { skipped: true, reason: 'No emojis found' };
  }
  
  // Remove emojis
  const cleaned = removeEmojis(contentMarkdown);
  
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
      removed: contentMarkdown.length - cleaned.length,
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
      cleanedLength: cleaned.length,
      removed: contentMarkdown.length - cleaned.length
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
    totalRemoved: 0,
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
      results.totalRemoved += result.removed || 0;
      log(`  ✅ ${doc.id} (removed ${result.removed} characters)`, 'green');
    } else if (result.error) {
      results.errors++;
      log(`  ❌ ${doc.id}: ${result.error}`, 'red');
    } else if (result.skipped) {
      results.skipped++;
      if (result.reason !== 'No emojis found' && result.reason !== 'No contentMarkdown found') {
        log(`  ⏭️  ${doc.id}: ${result.reason}`, 'yellow');
      }
    }
  }
  
  return results;
}

// Main function
async function runCleanup(options = {}) {
  const { dryRun = false, force = false } = options;
  
  log('\n🧹 Remove Emojis and Icons from Content', 'bold');
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
        errors: 0,
        totalRemoved: 0
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
      cleanupResults.summary.totalRemoved += col.totalRemoved || 0;
    });
    
    // Print summary
    log('\n' + '='.repeat(50), 'cyan');
    log('\n📊 Cleanup Summary', 'bold');
    log(`   Total documents: ${cleanupResults.summary.totalDocuments}`, 'cyan');
    log(`   Processed: ${cleanupResults.summary.processed}`, 'green');
    log(`   Skipped: ${cleanupResults.summary.skipped}`, 'yellow');
    log(`   Errors: ${cleanupResults.summary.errors}`, 
        cleanupResults.summary.errors > 0 ? 'red' : 'green');
    if (cleanupResults.summary.processed > 0) {
      log(`   Total characters removed: ${cleanupResults.summary.totalRemoved}`, 'green');
    }
    
    // Save report
    const reportFile = `emoji-cleanup-report-${Date.now()}.json`;
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

