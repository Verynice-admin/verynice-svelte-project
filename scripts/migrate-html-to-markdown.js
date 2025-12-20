#!/usr/bin/env node
/**
 * HTML to Markdown Migration Script
 * Converts HTML content in Firebase to Markdown format
 * 
 * Usage: node scripts/migrate-html-to-markdown.js [options]
 * Options:
 *   --dry-run        Preview changes without applying them
 *   --collection     Specific collection path (e.g., "pages/historyPage/sections")
 *   --backup         Create backup before migration
 *   --force          Skip confirmation prompts
 */

import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import TurndownService from 'turndown';

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

// Configure Turndown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*',
  strongDelimiter: '**',
  linkStyle: 'inlined',
});

turndownService.addRule('preserveImages', {
  filter: 'img',
  replacement: function (content, node) {
    const img = node;
    const alt = img.getAttribute('alt') || '';
    const src = img.getAttribute('src') || '';
    const title = img.getAttribute('title');
    return `![${alt}](${src}${title ? ` "${title}"` : ''})`;
  }
});

// Convert HTML to Markdown
function htmlToMarkdown(html) {
  if (!html || typeof html !== 'string') return '';
  
  try {
    let markdown = turndownService.turndown(html.trim());
    // Clean up
    markdown = markdown
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+$/gm, '')
      .trim();
    return markdown;
  } catch (error) {
    console.error('Conversion error:', error);
    return '';
  }
}

// Calculate storage savings
function calculateSavings(html, markdown) {
  const htmlSize = new Blob([html]).size;
  const markdownSize = new Blob([markdown]).size;
  const savings = htmlSize > 0 ? ((htmlSize - markdownSize) / htmlSize * 100).toFixed(1) : 0;
  return { htmlSize, markdownSize, savings: parseFloat(savings) };
}

// Migrate document
async function migrateDocument(docRef, data, dryRun = false) {
  const contentHTML = data.contentHTML || data.content || '';
  
  if (!contentHTML || typeof contentHTML !== 'string' || contentHTML.trim().length === 0) {
    return { skipped: true, reason: 'No HTML content found' };
  }
  
  // Skip if already has Markdown
  if (data.contentMarkdown && data.contentMarkdown.trim().length > 0) {
    return { skipped: true, reason: 'Already has contentMarkdown' };
  }
  
  // Convert to Markdown
  const markdown = htmlToMarkdown(contentHTML);
  
  if (!markdown || markdown.trim().length === 0) {
    return { skipped: true, reason: 'Conversion resulted in empty Markdown' };
  }
  
  const savings = calculateSavings(contentHTML, markdown);
  
  if (dryRun) {
    return {
      skipped: false,
      dryRun: true,
      markdown,
      savings,
      wouldUpdate: {
        contentMarkdown: markdown,
        contentFormat: 'markdown'
      }
    };
  }
  
  // Update document
  try {
    await docRef.update({
      contentMarkdown: markdown,
      contentFormat: 'markdown'
    });
    
    return {
      skipped: false,
      migrated: true,
      markdown,
      savings
    };
  } catch (error) {
    return {
      skipped: false,
      error: error.message
    };
  }
}

// Migrate collection
async function migrateCollection(db, collectionPath, options = {}) {
  const { dryRun = false, backup = false } = options;
  
  log(`\n📁 Migrating: ${collectionPath}`, 'cyan');
  
  const parts = collectionPath.split('/').filter(p => p.length > 0);
  let collectionRef;
  
  if (parts.length === 1) {
    // Top-level collection: pages
    collectionRef = db.collection(parts[0]);
  } else if (parts.length === 3) {
    // Nested collection: pages/{pageId}/sections
    collectionRef = db.doc(`${parts[0]}/${parts[1]}`).collection(parts[2]);
  } else {
    throw new Error(`Invalid collection path: ${collectionPath}. Expected format: "pages" or "pages/{pageId}/sections"`);
  }
  
  const snapshot = await collectionRef.get();
  const results = {
    total: snapshot.size,
    migrated: 0,
    skipped: 0,
    errors: 0,
    totalSavings: 0,
    documents: []
  };
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const result = await migrateDocument(doc.ref, data, dryRun);
    
    results.documents.push({
      id: doc.id,
      path: doc.ref.path,
      ...result
    });
    
    if (result.migrated) {
      results.migrated++;
      results.totalSavings += result.savings.savings || 0;
      log(`  ✅ ${doc.id} (saved ${result.savings.savings}%)`, 'green');
    } else if (result.error) {
      results.errors++;
      log(`  ❌ ${doc.id}: ${result.error}`, 'red');
    } else if (result.skipped) {
      results.skipped++;
      if (result.reason !== 'No HTML content found') {
        log(`  ⏭️  ${doc.id}: ${result.reason}`, 'yellow');
      }
    }
  }
  
  return results;
}

// Main migration function
async function runMigration(options = {}) {
  const { dryRun = false, collection = null, backup = false, force = false } = options;
  
  log('\n🔄 HTML to Markdown Migration', 'bold');
  log('='.repeat(50), 'cyan');
  
  if (dryRun) {
    log('⚠️  DRY RUN MODE - No changes will be made', 'yellow');
  }
  
  if (!force && !dryRun) {
    log('\n⚠️  WARNING: This will modify your Firebase database!', 'red');
    log('Press Ctrl+C to cancel, or wait 5 seconds to continue...', 'yellow');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  try {
    const db = initFirebase();
    log('✅ Firebase Admin initialized', 'green');
    
    const migrationResults = {
      timestamp: new Date().toISOString(),
      dryRun,
      collections: [],
      summary: {
        totalDocuments: 0,
        migrated: 0,
        skipped: 0,
        errors: 0,
        averageSavings: 0
      }
    };
    
    if (collection) {
      // Migrate specific collection
      const result = await migrateCollection(db, collection, { dryRun, backup });
      migrationResults.collections.push({
        path: collection,
        ...result
      });
    } else {
      // Migrate all sections
      log('\n📋 Finding all sections to migrate...', 'blue');
      
      const pagesSnapshot = await db.collection('pages').get();
      for (const pageDoc of pagesSnapshot.docs) {
        const collectionPath = `pages/${pageDoc.id}/sections`;
        const result = await migrateCollection(db, collectionPath, { dryRun, backup });
        if (result.total > 0) {
          migrationResults.collections.push({
            path: collectionPath,
            ...result
          });
        }
      }
    }
    
    // Calculate summary
    migrationResults.collections.forEach(col => {
      migrationResults.summary.totalDocuments += col.total;
      migrationResults.summary.migrated += col.migrated;
      migrationResults.summary.skipped += col.skipped;
      migrationResults.summary.errors += col.errors;
    });
    
    const totalSavings = migrationResults.collections.reduce((sum, col) => {
      return sum + (col.totalSavings || 0);
    }, 0);
    
    migrationResults.summary.averageSavings = migrationResults.summary.migrated > 0
      ? (totalSavings / migrationResults.summary.migrated).toFixed(1)
      : 0;
    
    // Print summary
    log('\n' + '='.repeat(50), 'cyan');
    log('\n📊 Migration Summary', 'bold');
    log(`   Total documents: ${migrationResults.summary.totalDocuments}`, 'cyan');
    log(`   Migrated: ${migrationResults.summary.migrated}`, 'green');
    log(`   Skipped: ${migrationResults.summary.skipped}`, 'yellow');
    log(`   Errors: ${migrationResults.summary.errors}`, 
        migrationResults.summary.errors > 0 ? 'red' : 'green');
    if (migrationResults.summary.migrated > 0) {
      log(`   Average storage savings: ${migrationResults.summary.averageSavings}%`, 'green');
    }
    
    // Save report
    const reportFile = `migration-report-${Date.now()}.json`;
    writeFileSync(reportFile, JSON.stringify(migrationResults, null, 2));
    log(`\n💾 Report saved to: ${reportFile}`, 'green');
    
    if (dryRun) {
      log('\n💡 Run without --dry-run to apply changes', 'yellow');
    }
    
  } catch (error) {
    log(`\n❌ Migration failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  collection: null,
  backup: args.includes('--backup'),
  force: args.includes('--force')
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--collection' && args[i + 1]) {
    options.collection = args[i + 1];
    i++;
  }
}

// Run migration
runMigration(options).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

