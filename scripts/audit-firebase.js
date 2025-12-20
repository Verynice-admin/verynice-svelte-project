#!/usr/bin/env node
/**
 * Firebase Database Audit Script
 * Automatically audits Firestore database for correctness, consistency, and quality issues
 * 
 * Usage: node scripts/audit-firebase.js [options]
 * Options:
 *   --collection <name>  Audit specific collection only
 *   --output <file>      Save report to file (default: audit-report.json)
 *   --verbose            Show detailed output
 */

import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Color codes for terminal output
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

// Detect content format
function detectContentFormat(content) {
  if (!content || typeof content !== 'string') return 'empty';
  const trimmed = content.trim();
  if (trimmed.length === 0) return 'empty';
  
  // Check for HTML tags
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return 'html';
  
  // Check for Markdown syntax
  const markdownPatterns = [
    /^#{1,6}\s+/m,
    /^\*\s+/m,
    /^\d+\.\s+/m,
    /\[.*?\]\(.*?\)/,
    /!\[.*?\]\(.*?\)/,
    /^\s*>/m,
    /`[^`]+`/,
    /```[\s\S]*?```/,
    /\*\*.*?\*\*/,
    /\*.*?\*/,
  ];
  
  if (markdownPatterns.some(p => p.test(trimmed))) return 'markdown';
  return 'plain';
}

// Validate section document
function validateSection(docId, data) {
  const issues = [];
  const warnings = [];
  const info = [];

  // Required fields
  if (!data.title && !data.name && !data.heading) {
    issues.push('Missing title field (title, name, or heading)');
  }

  // Content validation
  const contentHTML = data.contentHTML || data.content || '';
  const contentMarkdown = data.contentMarkdown || '';
  const contentFormat = data.contentFormat || 'auto';
  
  if (!contentHTML && !contentMarkdown) {
    issues.push('Missing content (contentHTML or contentMarkdown)');
  } else {
    const hasHTML = contentHTML && contentHTML.trim().length > 0;
    const hasMarkdown = contentMarkdown && contentMarkdown.trim().length > 0;
    
    if (hasHTML && hasMarkdown) {
      warnings.push('Has both contentHTML and contentMarkdown (should use one)');
    }
    
    if (hasHTML) {
      const detected = detectContentFormat(contentHTML);
      if (detected === 'html' && contentFormat === 'markdown') {
        warnings.push('contentFormat is "markdown" but contentHTML contains HTML');
      }
      if (contentHTML.trim().length < 10) {
        issues.push('contentHTML is too short (< 10 characters)');
      }
      if (contentHTML.length > 100000) {
        warnings.push('contentHTML is very long (> 100,000 characters)');
      }
      
      // Check for HTML storage issues (the main concern)
      const htmlTagCount = (contentHTML.match(/<[^>]+>/g) || []).length;
      const textLength = contentHTML.replace(/<[^>]+>/g, '').trim().length;
      const htmlOverhead = htmlTagCount > 0 ? ((htmlTagCount * 10) / textLength * 100).toFixed(1) : 0;
      
      if (htmlTagCount > 5 && parseFloat(htmlOverhead) > 20) {
        warnings.push(`Using HTML format (${htmlTagCount} tags, ~${htmlOverhead}% overhead). Consider migrating to Markdown for better storage efficiency.`);
      }
      
      // Check for potentially dangerous HTML
      if (/<script/i.test(contentHTML)) {
        issues.push('Contains <script> tags (security risk)');
      }
      if (/on\w+\s*=/i.test(contentHTML)) {
        warnings.push('Contains event handlers (onclick, etc.) - should be sanitized');
      }
      if (/javascript:/i.test(contentHTML)) {
        issues.push('Contains javascript: URLs (security risk)');
      }
    }
    
    if (hasMarkdown) {
      const detected = detectContentFormat(contentMarkdown);
      if (detected === 'html') {
        warnings.push('contentMarkdown contains HTML tags (should be Markdown)');
      }
      if (contentMarkdown.trim().length < 10) {
        issues.push('contentMarkdown is too short (< 10 characters)');
      }
    }
    
    // Recommendation: prefer Markdown
    if (hasHTML && !hasMarkdown) {
      info.push('Consider migrating from HTML to Markdown format for better storage efficiency and maintainability');
    }
  }

  // Image validation
  if (data.images && Array.isArray(data.images)) {
    data.images.forEach((img, idx) => {
      if (typeof img === 'string') {
        if (!img.trim()) {
          issues.push(`Image ${idx}: Missing publicId (image is empty string)`);
        }
      } else if (typeof img === 'object') {
        if (!img.publicId && !img.public_id && !img.url) {
          issues.push(`Image ${idx}: Missing publicId/public_id/url`);
        }
        if (!img.alt && !img.altText) {
          warnings.push(`Image ${idx}: Missing alt text (accessibility issue)`);
        } else if (img.alt && img.alt.trim().length < 3) {
          warnings.push(`Image ${idx}: Alt text too short (< 3 characters)`);
        }
      }
    });
  }

  // Order field
  if (data.order === undefined || data.order === null) {
    warnings.push('Missing order field (may affect sorting)');
  } else if (typeof data.order !== 'number') {
    issues.push('order field is not a number');
  }

  // Section ID
  if (!data.sectionId && !docId) {
    warnings.push('Missing sectionId field');
  }

  return { issues, warnings, info };
}

// Validate page document
function validatePage(docId, data) {
  const issues = [];
  const warnings = [];
  const info = [];

  // Required fields
  if (!data.mainTitle && !data.title) {
    warnings.push('Missing mainTitle or title');
  }

  // Author validation
  if (data.authorId && typeof data.authorId !== 'string') {
    issues.push('authorId is not a string');
  }

  // SEO fields
  if (data.seo) {
    if (!data.seo.title && !data.mainTitle) {
      warnings.push('Missing SEO title');
    }
    if (!data.seo.description) {
      warnings.push('Missing SEO description');
    }
  }

  // FAQ validation
  if (data.faqSection && Array.isArray(data.faqSection)) {
    data.faqSection.forEach((faq, idx) => {
      if (!faq.question) {
        issues.push(`FAQ ${idx}: Missing question`);
      }
      if (!faq.answer && !faq.answerMarkdown) {
        issues.push(`FAQ ${idx}: Missing answer`);
      }
    });
  }

  return { issues, warnings, info };
}

// Validate author document
function validateAuthor(docId, data) {
  const issues = [];
  const warnings = [];
  const info = [];

  if (!data.name && !data.authorName) {
    issues.push('Missing name or authorName');
  }

  if (!data.profilePicturePublicId && !data.authorImagePublicId && !data.avatarPublicId) {
    warnings.push('Missing profile picture (profilePicturePublicId, authorImagePublicId, or avatarPublicId)');
  }

  if (!data.bio && !data.description && !data.authorBio) {
    warnings.push('Missing bio/description');
  }

  return { issues, warnings, info };
}

// Audit collection
async function auditCollection(db, collectionName, verbose = false) {
  const results = {
    collection: collectionName,
    totalDocuments: 0,
    documents: [],
    summary: {
      totalIssues: 0,
      totalWarnings: 0,
      documentsWithIssues: 0,
      documentsWithWarnings: 0
    }
  };

  try {
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.get();
    
    results.totalDocuments = snapshot.size;
    log(`\n📁 Auditing collection: ${collectionName} (${snapshot.size} documents)`, 'cyan');

    for (const doc of snapshot.docs) {
      const data = doc.data();
      let validation;

      // Route to appropriate validator based on collection
      if (collectionName.includes('sections') || collectionName === 'sections') {
        validation = validateSection(doc.id, data);
      } else if (collectionName === 'pages' || collectionName.includes('pages')) {
        validation = validatePage(doc.id, data);
      } else if (collectionName === 'authors') {
        validation = validateAuthor(doc.id, data);
      } else {
        // Generic validation
        validation = { issues: [], warnings: [], info: [] };
      }

      const hasIssues = validation.issues.length > 0;
      const hasWarnings = validation.warnings.length > 0;

      if (hasIssues) {
        results.summary.documentsWithIssues++;
        results.summary.totalIssues += validation.issues.length;
      }
      if (hasWarnings) {
        results.summary.documentsWithWarnings++;
        results.summary.totalWarnings += validation.warnings.length;
      }

      results.documents.push({
        id: doc.id,
        path: doc.ref.path,
        issues: validation.issues,
        warnings: validation.warnings,
        info: validation.info,
        hasIssues,
        hasWarnings
      });

      if (verbose || hasIssues || hasWarnings) {
        if (hasIssues) {
          log(`  ❌ ${doc.id}`, 'red');
          validation.issues.forEach(issue => log(`     - ${issue}`, 'red'));
        } else if (hasWarnings) {
          log(`  ⚠️  ${doc.id}`, 'yellow');
          validation.warnings.forEach(warning => log(`     - ${warning}`, 'yellow'));
        } else if (verbose) {
          log(`  ✅ ${doc.id}`, 'green');
        }
      }
    }

  } catch (error) {
    log(`  ❌ Error auditing collection ${collectionName}: ${error.message}`, 'red');
    results.error = error.message;
  }

  return results;
}

// Audit nested collections (e.g., pages/{pageId}/sections)
async function auditNestedCollection(db, parentPath, collectionName, verbose = false) {
  const results = {
    collection: `${parentPath}/${collectionName}`,
    totalDocuments: 0,
    documents: [],
    summary: {
      totalIssues: 0,
      totalWarnings: 0,
      documentsWithIssues: 0,
      documentsWithWarnings: 0
    }
  };

  try {
    const parentRef = db.doc(parentPath);
    const collectionRef = parentRef.collection(collectionName);
    const snapshot = await collectionRef.orderBy('order', 'asc').get();
    
    results.totalDocuments = snapshot.size;
    log(`\n📁 Auditing nested collection: ${parentPath}/${collectionName} (${snapshot.size} documents)`, 'cyan');

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const validation = validateSection(doc.id, data);

      const hasIssues = validation.issues.length > 0;
      const hasWarnings = validation.warnings.length > 0;

      if (hasIssues) {
        results.summary.documentsWithIssues++;
        results.summary.totalIssues += validation.issues.length;
      }
      if (hasWarnings) {
        results.summary.documentsWithWarnings++;
        results.summary.totalWarnings += validation.warnings.length;
      }

      results.documents.push({
        id: doc.id,
        path: doc.ref.path,
        issues: validation.issues,
        warnings: validation.warnings,
        info: validation.info,
        hasIssues,
        hasWarnings
      });

      if (verbose || hasIssues || hasWarnings) {
        if (hasIssues) {
          log(`  ❌ ${doc.id}`, 'red');
          validation.issues.forEach(issue => log(`     - ${issue}`, 'red'));
        } else if (hasWarnings) {
          log(`  ⚠️  ${doc.id}`, 'yellow');
          validation.warnings.forEach(warning => log(`     - ${warning}`, 'yellow'));
        } else if (verbose) {
          log(`  ✅ ${doc.id}`, 'green');
        }
      }
    }

  } catch (error) {
    log(`  ❌ Error auditing nested collection: ${error.message}`, 'red');
    results.error = error.message;
  }

  return results;
}

// Main audit function
async function runAudit(options = {}) {
  const { collection: specificCollection, verbose = false, output } = options;
  
  log('\n🔍 Firebase Database Audit', 'bold');
  log('=' .repeat(50), 'cyan');

  try {
    const db = initFirebase();
    const app = getApps()[0];
    log('✅ Firebase Admin initialized', 'green');

    const auditResults = {
      timestamp: new Date().toISOString(),
      projectId: app.options.projectId || 'unknown',
      collections: [],
      summary: {
        totalCollections: 0,
        totalDocuments: 0,
        totalIssues: 0,
        totalWarnings: 0,
        documentsWithIssues: 0,
        documentsWithWarnings: 0
      }
    };

    if (specificCollection) {
      // Audit specific collection
      const result = await auditCollection(db, specificCollection, verbose);
      auditResults.collections.push(result);
    } else {
      // Audit all known collections
      log('\n📋 Auditing main collections...', 'blue');
      
      // Audit pages collection
      const pagesResult = await auditCollection(db, 'pages', verbose);
      auditResults.collections.push(pagesResult);

      // Audit authors collection
      const authorsResult = await auditCollection(db, 'authors', verbose);
      auditResults.collections.push(authorsResult);

      // Audit nested sections (pages/{pageId}/sections)
      log('\n📋 Auditing nested collections...', 'blue');
      const pagesSnapshot = await db.collection('pages').get();
      
      for (const pageDoc of pagesSnapshot.docs) {
        const sectionsResult = await auditNestedCollection(
          db,
          `pages/${pageDoc.id}`,
          'sections',
          verbose
        );
        if (sectionsResult.totalDocuments > 0) {
          auditResults.collections.push(sectionsResult);
        }
      }
    }

    // Calculate summary
    auditResults.summary.totalCollections = auditResults.collections.length;
    auditResults.collections.forEach(col => {
      auditResults.summary.totalDocuments += col.totalDocuments;
      auditResults.summary.totalIssues += col.summary.totalIssues;
      auditResults.summary.totalWarnings += col.summary.totalWarnings;
      auditResults.summary.documentsWithIssues += col.summary.documentsWithIssues;
      auditResults.summary.documentsWithWarnings += col.summary.documentsWithWarnings;
    });

    // Print summary
    log('\n' + '='.repeat(50), 'cyan');
    log('\n📊 Audit Summary', 'bold');
    log(`   Collections audited: ${auditResults.summary.totalCollections}`, 'cyan');
    log(`   Total documents: ${auditResults.summary.totalDocuments}`, 'cyan');
    log(`   Documents with issues: ${auditResults.summary.documentsWithIssues}`, 
        auditResults.summary.documentsWithIssues > 0 ? 'red' : 'green');
    log(`   Documents with warnings: ${auditResults.summary.documentsWithWarnings}`, 
        auditResults.summary.documentsWithWarnings > 0 ? 'yellow' : 'green');
    log(`   Total issues: ${auditResults.summary.totalIssues}`, 
        auditResults.summary.totalIssues > 0 ? 'red' : 'green');
    log(`   Total warnings: ${auditResults.summary.totalWarnings}`, 
        auditResults.summary.totalWarnings > 0 ? 'yellow' : 'green');

    // Save report
    if (output) {
      const outputPath = resolve(output);
      writeFileSync(outputPath, JSON.stringify(auditResults, null, 2));
      log(`\n💾 Report saved to: ${outputPath}`, 'green');
    } else {
      const defaultOutput = 'audit-report.json';
      writeFileSync(defaultOutput, JSON.stringify(auditResults, null, 2));
      log(`\n💾 Report saved to: ${defaultOutput}`, 'green');
    }

    // Exit with error code if issues found
    if (auditResults.summary.totalIssues > 0) {
      process.exit(1);
    }

  } catch (error) {
    log(`\n❌ Audit failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  collection: null,
  verbose: false,
  output: null
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--collection' && args[i + 1]) {
    options.collection = args[i + 1];
    i++;
  } else if (args[i] === '--output' && args[i + 1]) {
    options.output = args[i + 1];
    i++;
  } else if (args[i] === '--verbose') {
    options.verbose = true;
  }
}

// Run audit
runAudit(options).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

