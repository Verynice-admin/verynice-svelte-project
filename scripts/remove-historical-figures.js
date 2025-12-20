#!/usr/bin/env node
/**
 * Script to remove the Historical Figures section from Firebase
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

const db = initFirebase();
log('✅ Firebase Admin initialized', 'green');

async function removeHistoricalFigures() {
  try {
    log('\n🔍 Searching for Historical Figures section...', 'cyan');
    
    const sectionsRef = db.collection('pages').doc('historyPage').collection('sections');
    const sectionsSnapshot = await sectionsRef.get();
    
    log(`\n📋 Found ${sectionsSnapshot.size} sections`, 'cyan');
    
    // Find and delete the Historical Figures section
    let found = false;
    for (const doc of sectionsSnapshot.docs) {
      const data = doc.data();
      const title = (data.title || '').toLowerCase();
      const sectionId = (data.sectionId || '').toLowerCase();
      const docId = doc.id.toLowerCase();
      
      if (title.includes('figure') || 
          title.includes('historical figure') ||
          sectionId.includes('figure') ||
          sectionId.includes('historical-figure') ||
          docId.includes('figure') ||
          docId.includes('historical')) {
        
        log(`\n🗑️  Found section to delete:`, 'yellow');
        log(`   ID: ${doc.id}`, 'yellow');
        log(`   Title: ${data.title}`, 'yellow');
        log(`   SectionId: ${data.sectionId}`, 'yellow');
        log(`   Order: ${data.order}`, 'yellow');
        
        await doc.ref.delete();
        log(`\n✅ Successfully deleted Historical Figures section`, 'green');
        found = true;
        break;
      }
    }
    
    if (!found) {
      log('\n⚠️  Historical Figures section not found', 'yellow');
      log('   Listing all sections for reference:', 'yellow');
      sectionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        log(`   - ${doc.id}: "${data.title}" (${data.sectionId})`, 'blue');
      });
    }
    
    log('\n✅ Operation complete!', 'green');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    if (error.stack) {
      log(error.stack, 'red');
    }
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

removeHistoricalFigures();















