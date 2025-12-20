#!/usr/bin/env node
/**
 * Script to update history page map coordinates to Astana
 */

import { readFileSync, existsSync } from 'node:fs';
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

const db = initFirebase();
log('✅ Firebase Admin initialized', 'green');

async function updateMapToAstana() {
  try {
    log('\n🔍 Updating history page map to Astana...', 'cyan');
    
    const historyPageRef = db.collection('pages').doc('historyPage');
    const historyPageDoc = await historyPageRef.get();
    
    if (!historyPageDoc.exists) {
      log('❌ historyPage document not found', 'red');
      process.exit(1);
    }
    
    // Astana (Nur-Sultan) coordinates
    const astanaCoordinates = {
      lat: 51.169392,
      lng: 71.449074
    };
    
    await historyPageRef.update({
      mapCoordinates: astanaCoordinates,
      updatedAt: Timestamp.now()
    });
    
    log('\n✅ Successfully updated map coordinates to Astana!', 'green');
    log(`   Latitude: ${astanaCoordinates.lat}`, 'green');
    log(`   Longitude: ${astanaCoordinates.lng}`, 'green');
    log('\n💡 The map will now show Astana (Nur-Sultan) as the location.', 'cyan');
    
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

updateMapToAstana();

