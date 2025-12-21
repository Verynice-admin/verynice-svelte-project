/**
 * Add relatedPostsTitle to relatedPosts subcollection if missing
 */

import { db } from '../_scripts/lib/firebase.js';

const HISTORY_PAGE_ID = 'historyPage';

async function addRelatedPostsTitle() {
  try {
    console.log('📚 Adding relatedPostsTitle to subcollection...\n');

    const pageRef = db.collection('pages').doc(HISTORY_PAGE_ID);
    const pageSnap = await pageRef.get();

    if (!pageSnap.exists) {
      console.error(`❌ Document pages/${HISTORY_PAGE_ID} does not exist!`);
      process.exit(1);
    }

    const pageData = pageSnap.data();
    const relatedPostsRef = pageRef.collection('relatedPosts');
    const mainDocRef = relatedPostsRef.doc('main');
    const mainDoc = await mainDocRef.get();

    if (!mainDoc.exists && pageData.relatedPostsTitle) {
      await mainDocRef.set({
        title: pageData.relatedPostsTitle,
        order: -1
      });
      console.log(`   ✓ Added title: "${pageData.relatedPostsTitle}"`);
    } else if (mainDoc.exists) {
      console.log('   ℹ️  Title document already exists');
    } else {
      console.log('   ⚠️  No relatedPostsTitle found in document');
    }

    console.log('\n✅ Done!\n');

  } catch (error) {
    console.error('❌ Failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

addRelatedPostsTitle()
  .then(() => {
    console.log('✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });













