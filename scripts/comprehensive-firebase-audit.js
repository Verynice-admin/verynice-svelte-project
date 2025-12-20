#!/usr/bin/env node
/**
 * Comprehensive Firebase Database Audit
 * Reviews all collections, naming conventions, structure, and navigation logic
 * 
 * Usage: node scripts/comprehensive-firebase-audit.js
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

// Expected structure based on codebase
const EXPECTED_STRUCTURE = {
  collections: {
    'pages': {
      documents: ['homepage', 'historyPage', 'aboutPage'],
      subcollections: {
        'sections': {
          requiredFields: ['title', 'contentMarkdown', 'order'],
          optionalFields: ['contentHTML', 'contentFormat', 'images', 'sectionId']
        }
      }
    },
    'authors': {
      documents: [], // Dynamic
      requiredFields: ['name', 'bio'],
      optionalFields: ['profilePicturePublicId', 'authorImagePublicId', 'avatarPublicId', 'title', 'description']
    }
  },
  namingConventions: {
    pages: {
      pattern: /^[a-z]+Page$/,
      examples: ['homepage', 'historyPage', 'aboutPage']
    },
    sections: {
      pattern: /^section-[a-z0-9-]+$/,
      examples: ['section-the-beginning', 'section-golden-man']
    },
    authors: {
      pattern: /^[a-z0-9-_]+$/,
      examples: ['aliya-askar']
    }
  }
};

async function auditCollection(db, collectionName, expectedStructure) {
  const issues = [];
  const warnings = [];
  const info = [];
  
  try {
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.get();
    
    info.push(`Found ${snapshot.size} documents in '${collectionName}'`);
    
    // Check each document
    for (const doc of snapshot.docs) {
      const docId = doc.id;
      const data = doc.data();
      
      // Check naming convention
      if (collectionName === 'pages') {
        // Allow 'homepage' as it's a valid exception
        const validPageNames = ['homepage', 'historyPage', 'aboutPage'];
        if (!EXPECTED_STRUCTURE.namingConventions.pages.pattern.test(docId) && !validPageNames.includes(docId)) {
          warnings.push(`Page document '${docId}' doesn't match naming convention (should be like 'homepage', 'historyPage')`);
        }
      } else if (collectionName === 'authors') {
        if (!EXPECTED_STRUCTURE.namingConventions.authors.pattern.test(docId)) {
          warnings.push(`Author document '${docId}' doesn't match naming convention`);
        }
      }
      
      // Check for duplicate author IDs (found aliya-askar and aliya_askar)
      if (collectionName === 'authors') {
        const similarIds = snapshot.docs
          .map(d => d.id)
          .filter(id => id.replace(/[-_]/g, '') === docId.replace(/[-_]/g, '') && id !== docId);
        if (similarIds.length > 0) {
          issues.push(`Author '${docId}' has similar IDs that might be duplicates: ${similarIds.join(', ')}`);
        }
      }
      
      // Check required fields
      if (expectedStructure.requiredFields) {
        for (const field of expectedStructure.requiredFields) {
          if (!(field in data) || data[field] === null || data[field] === undefined) {
            issues.push(`Document '${docId}' missing required field '${field}'`);
          } else if (typeof data[field] === 'string' && data[field].trim().length === 0) {
            warnings.push(`Document '${docId}' has empty required field '${field}'`);
          }
        }
      }
      
      // Check subcollections
      if (expectedStructure.subcollections) {
        for (const [subName, subStructure] of Object.entries(expectedStructure.subcollections)) {
          const subCollectionRef = doc.ref.collection(subName);
          const subSnapshot = await subCollectionRef.get();
          
          info.push(`  └─ Subcollection '${subName}': ${subSnapshot.size} documents`);
          
          // Check subcollection documents
          for (const subDoc of subSnapshot.docs) {
            const subDocId = subDoc.id;
            const subData = subDoc.data();
            
            // Check naming convention for sections
            if (subName === 'sections') {
              if (!EXPECTED_STRUCTURE.namingConventions.sections.pattern.test(subDocId)) {
                warnings.push(`Section '${docId}/${subName}/${subDocId}' doesn't match naming convention (should be 'section-...')`);
              }
            }
            
            // Check required fields in subcollection
            if (subStructure.requiredFields) {
              for (const field of subStructure.requiredFields) {
                if (!(field in subData) || subData[field] === null || subData[field] === undefined) {
                  issues.push(`Section '${docId}/${subName}/${subDocId}' missing required field '${field}'`);
                } else if (typeof subData[field] === 'string' && subData[field].trim().length === 0) {
                  warnings.push(`Section '${docId}/${subName}/${subDocId}' has empty required field '${field}'`);
                }
              }
            }
            
            // Check order field for sections
            if (subName === 'sections' && 'order' in subData) {
              if (typeof subData.order !== 'number') {
                issues.push(`Section '${docId}/${subName}/${subDocId}' has invalid 'order' field (should be number)`);
              }
            }
            
            // Check content format
            if (subName === 'sections') {
              const hasMarkdown = !!(subData.contentMarkdown && subData.contentMarkdown.trim().length > 0);
              const hasHTML = !!(subData.contentHTML && subData.contentHTML.trim().length > 0);
              
              if (!hasMarkdown && !hasHTML) {
                issues.push(`Section '${docId}/${subName}/${subDocId}' has no content (neither contentMarkdown nor contentHTML)`);
              } else if (hasHTML && !hasMarkdown) {
                warnings.push(`Section '${docId}/${subName}/${subDocId}' still uses HTML format (should migrate to Markdown)`);
              }
            }
          }
        }
      }
    }
    
    return { issues, warnings, info };
  } catch (error) {
    return {
      issues: [`Error auditing collection '${collectionName}': ${error.message}`],
      warnings: [],
      info: []
    };
  }
}

async function main() {
  log('\n🔍 Comprehensive Firebase Database Audit', 'bold');
  log('='.repeat(60), 'cyan');
  
  try {
    const db = initFirebase();
    log('✅ Firebase Admin initialized', 'green');
    
    const allIssues = [];
    const allWarnings = [];
    const allInfo = [];
    
    // Audit each collection
    for (const [collectionName, expectedStructure] of Object.entries(EXPECTED_STRUCTURE.collections)) {
      log(`\n📁 Auditing collection: ${collectionName}`, 'blue');
      const result = await auditCollection(db, collectionName, expectedStructure);
      allIssues.push(...result.issues);
      allWarnings.push(...result.warnings);
      allInfo.push(...result.info);
      
      result.info.forEach(msg => log(`  ${msg}`, 'cyan'));
      result.warnings.forEach(msg => log(`  ⚠️  ${msg}`, 'yellow'));
      result.issues.forEach(msg => log(`  ❌ ${msg}`, 'red'));
    }
    
    // Summary
    log('\n' + '='.repeat(60), 'cyan');
    log('\n📊 Audit Summary', 'bold');
    log(`   Total Issues: ${allIssues.length}`, allIssues.length > 0 ? 'red' : 'green');
    log(`   Total Warnings: ${allWarnings.length}`, allWarnings.length > 0 ? 'yellow' : 'green');
    log(`   Collections Audited: ${Object.keys(EXPECTED_STRUCTURE.collections).length}`, 'cyan');
    
    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: allIssues.length,
        totalWarnings: allWarnings.length,
        collectionsAudited: Object.keys(EXPECTED_STRUCTURE.collections).length
      },
      issues: allIssues,
      warnings: allWarnings,
      info: allInfo
    };
    
    const reportFile = `comprehensive-audit-report-${Date.now()}.json`;
    writeFileSync(reportFile, JSON.stringify(report, null, 2));
    log(`\n💾 Full report saved to: ${reportFile}`, 'green');
    
    if (allIssues.length > 0) {
      log('\n⚠️  Issues found that need attention!', 'red');
      process.exit(1);
    } else {
      log('\n✅ No critical issues found!', 'green');
    }
    
  } catch (error) {
    log(`\n❌ Audit failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();

