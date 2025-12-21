#!/usr/bin/env node
/**
 * Verify All Routes and Firebase Collections
 * Ensures all routes have corresponding Firebase collections
 */

import { readFileSync, existsSync } from 'node:fs';
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

// Expected routes and their Firebase collections
const EXPECTED_ROUTES = {
  '/': {
    collection: 'pages',
    document: 'homepage',
    subcollection: null
  },
  '/history': {
    collection: 'pages',
    document: 'historyPage',
    subcollection: 'sections'
  },
  '/attractions': {
    collection: 'attractions',
    document: null,
    subcollection: null
  },
  '/tips': {
    collection: 'tips',
    document: null,
    subcollection: null
  }
};

async function verifyRoute(db, route, config) {
  const issues = [];
  const warnings = [];
  
  try {
    if (config.document) {
      // Document-based route (e.g., pages/homepage)
      const docRef = db.collection(config.collection).doc(config.document);
      const docSnap = await docRef.get();
      
      if (!docSnap.exists) {
        issues.push(`Route '${route}': Document '${config.collection}/${config.document}' does not exist`);
      } else {
        log(`  ✅ Route '${route}': Document exists`, 'green');
      }
      
      // Check subcollection if specified
      if (config.subcollection) {
        const subColRef = docRef.collection(config.subcollection);
        const subSnap = await subColRef.get();
        if (subSnap.empty) {
          warnings.push(`Route '${route}': Subcollection '${config.subcollection}' is empty`);
        } else {
          log(`  ✅ Route '${route}': Subcollection '${config.subcollection}' has ${subSnap.size} documents`, 'green');
        }
      }
    } else {
      // Collection-based route (e.g., attractions, tips)
      const colRef = db.collection(config.collection);
      const colSnap = await colRef.get();
      
      if (colSnap.empty) {
        warnings.push(`Route '${route}': Collection '${config.collection}' exists but is empty`);
      } else {
        log(`  ✅ Route '${route}': Collection '${config.collection}' has ${colSnap.size} documents`, 'green');
      }
    }
  } catch (error) {
    if (error.code === 5) { // NOT_FOUND
      issues.push(`Route '${route}': Collection '${config.collection}' does not exist`);
    } else {
      issues.push(`Route '${route}': Error - ${error.message}`);
    }
  }
  
  return { issues, warnings };
}

async function main() {
  log('\n🔍 Verifying All Routes and Firebase Collections', 'bold');
  log('='.repeat(60), 'cyan');
  
  try {
    const db = initFirebase();
    log('✅ Firebase Admin initialized', 'green');
    
    const allIssues = [];
    const allWarnings = [];
    
    for (const [route, config] of Object.entries(EXPECTED_ROUTES)) {
      log(`\n📁 Checking route: ${route}`, 'blue');
      const result = await verifyRoute(db, route, config);
      allIssues.push(...result.issues);
      allWarnings.push(...result.warnings);
    }
    
    log('\n' + '='.repeat(60), 'cyan');
    log('\n📊 Verification Summary', 'bold');
    log(`   Total Issues: ${allIssues.length}`, allIssues.length > 0 ? 'red' : 'green');
    log(`   Total Warnings: ${allWarnings.length}`, allWarnings.length > 0 ? 'yellow' : 'green');
    
    if (allIssues.length > 0) {
      log('\n❌ Issues:', 'red');
      allIssues.forEach(issue => log(`   - ${issue}`, 'red'));
    }
    
    if (allWarnings.length > 0) {
      log('\n⚠️  Warnings:', 'yellow');
      allWarnings.forEach(warning => log(`   - ${warning}`, 'yellow'));
    }
    
    if (allIssues.length === 0 && allWarnings.length === 0) {
      log('\n✅ All routes verified successfully!', 'green');
    }
    
  } catch (error) {
    log(`\n❌ Verification failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();




































