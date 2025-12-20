/**
 * Remove old page section fields from historyPage document
 * 
 * This script removes legacy fields after migration to subcollections:
 * - videoUrl, videoTitle
 * - mapCoordinates, mapTitle
 * - faqSection, faqTitle
 * - photoGallery, photoGalleryTitle
 */

import { db } from '../_scripts/lib/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

const HISTORY_PAGE_ID = 'historyPage';

const FIELDS_TO_REMOVE = [
  'videoUrl',
  'videoTitle',
  'mapCoordinates',
  'mapTitle',
  'faqSection',
  'faqTitle',
  'photoGallery',
  'photoGalleryTitle',
  'photoGalleryImages',
  'photoGalleryItems',
  'galleryPhotos',
  'galleryImages'
];

async function removeOldFields() {
  try {
    console.log('🧹 Removing old page section fields from historyPage document...\n');

    const pageRef = db.collection('pages').doc(HISTORY_PAGE_ID);
    const pageSnap = await pageRef.get();

    if (!pageSnap.exists) {
      console.error(`❌ Document pages/${HISTORY_PAGE_ID} does not exist!`);
      process.exit(1);
    }

    const pageData = pageSnap.data();
    const fieldsToDelete = [];

    // Check which fields exist and verify subcollections have data
    console.log('📋 Checking fields and subcollections...\n');

    for (const field of FIELDS_TO_REMOVE) {
      if (pageData[field] !== undefined) {
        // Verify corresponding subcollection exists
        let subcollectionName = null;
        if (field.startsWith('video')) subcollectionName = 'video';
        else if (field.startsWith('map')) subcollectionName = 'map';
        else if (field.startsWith('faq')) subcollectionName = 'faq';
        else if (field.startsWith('photo') || field.startsWith('gallery')) subcollectionName = 'photoGallery';

        if (subcollectionName) {
          const subcolRef = pageRef.collection(subcollectionName);
          const subcolDocs = await subcolRef.get();
          if (subcolDocs.size > 0) {
            fieldsToDelete.push(field);
            console.log(`   ✓ ${field} → ${subcollectionName} subcollection has data`);
          } else {
            console.log(`   ⚠️  ${field} exists but ${subcollectionName} subcollection is empty - skipping`);
          }
        } else {
          fieldsToDelete.push(field);
          console.log(`   ✓ ${field} - will be removed`);
        }
      }
    }

    if (fieldsToDelete.length === 0) {
      console.log('\nℹ️  No old fields found to remove.\n');
      return;
    }

    console.log(`\n🗑️  Removing ${fieldsToDelete.length} field(s)...\n`);

    // Build update object with FieldValue.delete() for each field
    const updateData = {};
    fieldsToDelete.forEach(field => {
      updateData[field] = FieldValue.delete();
    });

    await pageRef.update(updateData);

    console.log('✅ Successfully removed old fields from historyPage document!\n');
    console.log('✨ Subcollections are now the single source of truth.\n');

  } catch (error) {
    console.error('❌ Removal failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run removal
removeOldFields()
  .then(() => {
    console.log('🎉 Cleanup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });











