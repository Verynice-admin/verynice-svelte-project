/**
 * Remove subcollections for small data that's now back in the document
 * 
 * This script removes:
 * - labels subcollection
 * - breadcrumbs subcollection
 * - seo subcollection
 * - nextUpPreview subcollection
 * - relatedPosts/main document (but keeps the posts)
 */

import { db } from '../_scripts/lib/firebase.js';

const HISTORY_PAGE_ID = 'historyPage';

async function removeSmallDataSubcollections() {
  try {
    console.log('🧹 Removing small data subcollections...\n');

    const pageRef = db.collection('pages').doc(HISTORY_PAGE_ID);
    const pageSnap = await pageRef.get();

    if (!pageSnap.exists) {
      console.error(`❌ Document pages/${HISTORY_PAGE_ID} does not exist!`);
      process.exit(1);
    }

    let removed = 0;

    // 1. Remove labels subcollection
    const labelsRef = pageRef.collection('labels');
    const labelsSnap = await labelsRef.get();
    if (labelsSnap.size > 0) {
      const batch = db.batch();
      labelsSnap.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`   ✓ Removed ${labelsSnap.size} document(s) from labels subcollection`);
      removed++;
    }

    // 2. Remove breadcrumbs subcollection
    const breadcrumbsRef = pageRef.collection('breadcrumbs');
    const breadcrumbsSnap = await breadcrumbsRef.get();
    if (breadcrumbsSnap.size > 0) {
      const batch = db.batch();
      breadcrumbsSnap.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`   ✓ Removed ${breadcrumbsSnap.size} document(s) from breadcrumbs subcollection`);
      removed++;
    }

    // 3. Remove seo subcollection
    const seoRef = pageRef.collection('seo');
    const seoSnap = await seoRef.get();
    if (seoSnap.size > 0) {
      const batch = db.batch();
      seoSnap.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`   ✓ Removed ${seoSnap.size} document(s) from seo subcollection`);
      removed++;
    }

    // 4. Remove nextUpPreview subcollection
    const nextUpRef = pageRef.collection('nextUpPreview');
    const nextUpSnap = await nextUpRef.get();
    if (nextUpSnap.size > 0) {
      const batch = db.batch();
      nextUpSnap.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`   ✓ Removed ${nextUpSnap.size} document(s) from nextUpPreview subcollection`);
      removed++;
    }

    // 5. Remove relatedPosts/main document (but keep the posts)
    const relatedPostsMainRef = pageRef.collection('relatedPosts').doc('main');
    const relatedPostsMainSnap = await relatedPostsMainRef.get();
    if (relatedPostsMainSnap.exists) {
      await relatedPostsMainRef.delete();
      console.log('   ✓ Removed relatedPosts/main document (posts remain)');
      removed++;
    }

    if (removed === 0) {
      console.log('\nℹ️  No subcollections found to remove.\n');
      return;
    }

    console.log(`\n✅ Successfully removed ${removed} subcollection(s)!\n`);
    console.log('✨ Small data is now only in the document.\n');

  } catch (error) {
    console.error('❌ Removal failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run removal
removeSmallDataSubcollections()
  .then(() => {
    console.log('🎉 Cleanup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });











