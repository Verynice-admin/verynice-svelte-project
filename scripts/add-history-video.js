#!/usr/bin/env node
/**
 * Script to add a video URL to the history page
 * Usage: node scripts/add-history-video.js <video-url> [video-title]
 * Example: node scripts/add-history-video.js "https://www.youtube.com/watch?v=dQw4w9WgXcQ" "Kazakhstan History"
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

async function addHistoryVideo(videoUrl, videoTitle = 'Embedded Video') {
  try {
    if (!videoUrl) {
      log('\n❌ Error: Video URL is required', 'red');
      log('\nUsage: node scripts/add-history-video.js <video-url> [video-title]', 'yellow');
      log('Example: node scripts/add-history-video.js "https://www.youtube.com/watch?v=dQw4w9WgXcQ" "Kazakhstan History"', 'cyan');
      process.exit(1);
    }

    log('\n🔍 Adding video to history page...', 'cyan');

    const historyPageRef = db.collection('pages').doc('historyPage');
    const historyPageDoc = await historyPageRef.get();

    if (!historyPageDoc.exists) {
      log('❌ historyPage document not found', 'red');
      process.exit(1);
    }

    // Validate URL
    try {
      new URL(videoUrl);
    } catch (e) {
      log('❌ Error: Invalid URL format', 'red');
      process.exit(1);
    }

    // Update the video fields in the video subcollection
    const videoRef = historyPageRef.collection('video').doc('main');
    await videoRef.set({
      url: videoUrl,
      title: videoTitle,
      updatedAt: Timestamp.now()
    });

    log('\n✅ Successfully added video to history page!', 'green');
    log(`   Video URL: ${videoUrl}`, 'green');
    log(`   Video Title: ${videoTitle}`, 'green');
    log('\n💡 The video will now appear below the timeline sections on the history page.', 'cyan');

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

// Get command line arguments
const args = process.argv.slice(2);
const videoUrl = args[0];
const videoTitle = args[1] || 'Embedded Video';

addHistoryVideo(videoUrl, videoTitle);

















