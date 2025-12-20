#!/usr/bin/env node
/**
 * Script to check if videoUrl is set in historyPage
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

async function checkHistoryVideo() {
  try {
    log('\n🔍 Checking history page video configuration...', 'cyan');
    
    const historyPageRef = db.collection('pages').doc('historyPage');
    const historyPageDoc = await historyPageRef.get();
    
    if (!historyPageDoc.exists) {
      log('❌ historyPage document not found', 'red');
      process.exit(1);
    }
    
    const data = historyPageDoc.data();
    
    log('\n📋 Current video configuration:', 'cyan');
    log(`   videoUrl: ${data?.videoUrl || '❌ NOT SET'}`, data?.videoUrl ? 'green' : 'red');
    log(`   videoTitle: ${data?.videoTitle || '❌ NOT SET'}`, data?.videoTitle ? 'green' : 'yellow');
    
    if (!data?.videoUrl) {
      log('\n💡 To add a video, you need to set the videoUrl field in Firebase.', 'yellow');
      log('   The video will appear below the timeline sections.', 'yellow');
      log('   Supported formats: YouTube and Vimeo URLs', 'yellow');
      log('\n   Example YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID', 'cyan');
      log('   Example Vimeo URL: https://vimeo.com/VIDEO_ID', 'cyan');
    } else {
      log('\n✅ Video is configured!', 'green');
      log(`   URL: ${data.videoUrl}`, 'green');
      log(`   Title: ${data.videoTitle || 'Embedded Video'}`, 'green');
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

checkHistoryVideo();















