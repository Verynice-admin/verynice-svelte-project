/**
 * Migration script: Move page sections from historyPage document to subcollections
 * 
 * This script migrates:
 * - videoUrl, videoTitle → video subcollection
 * - mapCoordinates, mapTitle → map subcollection
 * - faqSection, faqTitle → faq subcollection
 * - photoGallery, photoGalleryTitle → photoGallery subcollection
 */

import { db } from '../_scripts/lib/firebase.js';

const HISTORY_PAGE_ID = 'historyPage';

async function migratePageSections() {
  try {
    console.log('🚀 Starting page sections migration...\n');

    const pageRef = db.collection('pages').doc(HISTORY_PAGE_ID);
    const pageSnap = await pageRef.get();

    if (!pageSnap.exists) {
      console.error(`❌ Document pages/${HISTORY_PAGE_ID} does not exist!`);
      process.exit(1);
    }

    const pageData = pageSnap.data();
    let migrated = 0;

    // 1. Migrate Video
    if (pageData.videoUrl) {
      console.log('📹 Migrating video data...');
      const videoRef = pageRef.collection('video').doc('main');
      const existingVideo = await videoRef.get();
      
      if (!existingVideo.exists) {
        await videoRef.set({
          url: pageData.videoUrl,
          title: pageData.videoTitle || 'Video',
          order: 0
        });
        console.log(`   ✓ Created video: ${pageData.videoTitle || 'Video'}`);
        migrated++;
      } else {
        console.log('   ℹ️  Video subcollection already exists');
      }
    }

    // 2. Migrate Map
    if (pageData.mapCoordinates) {
      console.log('🗺️  Migrating map data...');
      const mapRef = pageRef.collection('map').doc('main');
      const existingMap = await mapRef.get();
      
      if (!existingMap.exists) {
        // Handle both object and array formats
        let coordinates = pageData.mapCoordinates;
        if (Array.isArray(coordinates) && coordinates.length === 2) {
          coordinates = { lat: coordinates[0], lng: coordinates[1] };
        } else if (coordinates && typeof coordinates === 'object' && coordinates.latitude && coordinates.longitude) {
          coordinates = { lat: coordinates.latitude, lng: coordinates.longitude };
        }

        await mapRef.set({
          coordinates: coordinates,
          title: pageData.mapTitle || 'Location on Map',
          order: 0
        });
        console.log(`   ✓ Created map: ${pageData.mapTitle || 'Location on Map'}`);
        migrated++;
      } else {
        console.log('   ℹ️  Map subcollection already exists');
      }
    }

    // 3. Migrate FAQ
    if (pageData.faqSection && Array.isArray(pageData.faqSection) && pageData.faqSection.length > 0) {
      console.log('❓ Migrating FAQ data...');
      const faqRef = pageRef.collection('faq').doc('main');
      const existingFaq = await faqRef.get();
      
      if (!existingFaq.exists) {
        await faqRef.set({
          title: pageData.faqTitle || 'Frequently Asked Questions',
          items: pageData.faqSection,
          order: 0
        });
        console.log(`   ✓ Created FAQ with ${pageData.faqSection.length} items`);
        migrated++;
      } else {
        console.log('   ℹ️  FAQ subcollection already exists');
      }
    }

    // 4. Migrate Photo Gallery
    if (pageData.photoGallery && Array.isArray(pageData.photoGallery) && pageData.photoGallery.length > 0) {
      console.log('📸 Migrating photo gallery data...');
      const galleryRef = pageRef.collection('photoGallery').doc('main');
      const existingGallery = await galleryRef.get();
      
      if (!existingGallery.exists) {
        await galleryRef.set({
          title: pageData.photoGalleryTitle || 'Photo Gallery',
          photos: pageData.photoGallery,
          order: 0
        });
        console.log(`   ✓ Created photo gallery with ${pageData.photoGallery.length} photos`);
        migrated++;
      } else {
        console.log('   ℹ️  Photo gallery subcollection already exists');
      }
    }

    console.log(`\n✅ Migration complete! Migrated ${migrated} section(s) to subcollections.\n`);
    console.log('ℹ️  Old fields are still in the document.');
    console.log('   Run the cleanup script to remove them after verifying everything works.\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run migration
migratePageSections()
  .then(() => {
    console.log('✨ Migration script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
