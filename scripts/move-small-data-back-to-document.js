/**
 * Move small, static data back from subcollections to the document
 * 
 * This script moves:
 * - labels → back to document
 * - breadcrumbs → back to document
 * - seo → back to document
 * - nextUpPreview → back to document
 * - relatedPostsTitle → back to document (from relatedPosts/main)
 * 
 * These are small, rarely-changing items that don't need subcollections.
 */

import { db } from '../_scripts/lib/firebase.js';

const HISTORY_PAGE_ID = 'historyPage';

async function moveSmallDataBack() {
  try {
    console.log('🔄 Moving small data back to document...\n');

    const pageRef = db.collection('pages').doc(HISTORY_PAGE_ID);
    const pageSnap = await pageRef.get();

    if (!pageSnap.exists) {
      console.error(`❌ Document pages/${HISTORY_PAGE_ID} does not exist!`);
      process.exit(1);
    }

    const updateData = {};
    let moved = 0;

    // 1. Move labels
    const labelsRef = pageRef.collection('labels').doc('main');
    const labelsSnap = await labelsRef.get();
    if (labelsSnap.exists) {
      const labelsData = labelsSnap.data();
      // Remove order field if present
      const { order, ...labels } = labelsData;
      updateData.labels = labels;
      console.log('   ✓ Found labels in subcollection');
      moved++;
    }

    // 2. Move breadcrumbs
    const breadcrumbsRef = pageRef.collection('breadcrumbs');
    const breadcrumbsSnap = await breadcrumbsRef.orderBy('order', 'asc').get();
    if (breadcrumbsSnap.size > 0) {
      const breadcrumbs = breadcrumbsSnap.docs.map(doc => {
        const data = doc.data();
        const { order, ...crumb } = data;
        return crumb;
      });
      updateData.breadcrumbs = breadcrumbs;
      console.log(`   ✓ Found ${breadcrumbs.length} breadcrumbs in subcollection`);
      moved++;
    }

    // 3. Move SEO
    const seoRef = pageRef.collection('seo').doc('main');
    const seoSnap = await seoRef.get();
    if (seoSnap.exists) {
      const seoData = seoSnap.data();
      const { order, ...seo } = seoData;
      updateData.seo = seo;
      console.log('   ✓ Found SEO in subcollection');
      moved++;
    }

    // 4. Move nextUpPreview
    const nextUpRef = pageRef.collection('nextUpPreview').doc('main');
    const nextUpSnap = await nextUpRef.get();
    if (nextUpSnap.exists) {
      const nextUpData = nextUpSnap.data();
      const { order, ...nextUp } = nextUpData;
      updateData.nextUpPreview = nextUp;
      console.log('   ✓ Found nextUpPreview in subcollection');
      moved++;
    }

    // 5. Move relatedPostsTitle (from relatedPosts/main)
    const relatedPostsRef = pageRef.collection('relatedPosts');
    const relatedPostsMainSnap = await relatedPostsRef.doc('main').get();
    if (relatedPostsMainSnap.exists) {
      const mainData = relatedPostsMainSnap.data();
      if (mainData.title) {
        updateData.relatedPostsTitle = mainData.title;
        console.log(`   ✓ Found relatedPostsTitle: "${mainData.title}"`);
        moved++;
      }
    }

    if (Object.keys(updateData).length === 0) {
      console.log('\nℹ️  No data found in subcollections to move back.\n');
      return;
    }

    console.log(`\n📝 Updating document with ${Object.keys(updateData).length} field(s)...\n`);

    // Update the document
    await pageRef.update(updateData);

    console.log('✅ Successfully moved data back to document!\n');
    console.log('ℹ️  Subcollections still exist but are no longer used.');
    console.log('   Run the cleanup script to remove them after verifying everything works.\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run migration
moveSmallDataBack()
  .then(() => {
    console.log('✨ Migration script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });













