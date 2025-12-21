#!/usr/bin/env node
/**
 * Script to check if mapCoordinates is set in historyPage
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

async function checkHistoryMap() {
  try {
    log('\n🔍 Checking history page map configuration...', 'cyan');
    
    const historyPageRef = db.collection('pages').doc('historyPage');
    const historyPageDoc = await historyPageRef.get();
    
    if (!historyPageDoc.exists) {
      log('❌ historyPage document not found', 'red');
      process.exit(1);
    }
    
    const data = historyPageDoc.data();
    
    log('\n📋 Current map configuration:', 'cyan');
    
    if (data?.mapCoordinates) {
      log(`   mapCoordinates: ✅ SET`, 'green');
      log(`   - lat: ${data.mapCoordinates.lat}`, 'green');
      log(`   - lng: ${data.mapCoordinates.lng}`, 'green');
      
      // Validate coordinates
      if (typeof data.mapCoordinates.lat !== 'number' || typeof data.mapCoordinates.lng !== 'number') {
        log('\n⚠️  WARNING: Coordinates are not numbers!', 'yellow');
        log('   The Map component requires lat and lng to be numbers.', 'yellow');
      } else if (data.mapCoordinates.lat < -90 || data.mapCoordinates.lat > 90) {
        log('\n⚠️  WARNING: Invalid latitude! Must be between -90 and 90', 'yellow');
      } else if (data.mapCoordinates.lng < -180 || data.mapCoordinates.lng > 180) {
        log('\n⚠️  WARNING: Invalid longitude! Must be between -180 and 180', 'yellow');
      } else {
        log('\n✅ Coordinates are valid!', 'green');
      }
    } else {
      log(`   mapCoordinates: ❌ NOT SET`, 'red');
      log('\n💡 To add a map, you need to set the mapCoordinates field in Firebase.', 'yellow');
      log('   The map will appear below the timeline sections.', 'yellow');
      log('\n   Example coordinates for Kazakhstan:', 'cyan');
      log('   - Astana (Nur-Sultan): lat: 51.1694, lng: 71.4491', 'cyan');
      log('   - Almaty: lat: 43.2220, lng: 76.8512', 'cyan');
      log('   - Shymkent: lat: 42.3419, lng: 69.5901', 'cyan');
    }
    
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

checkHistoryMap();

















