/**
 * Migration script: Move remaining page sections from historyPage document to subcollections
 * 
 * This script migrates:
 * - relatedPosts → relatedPosts subcollection
 * - seo → seo subcollection
 * - nextUpPreview → nextUpPreview subcollection
 * - labels → labels subcollection
 * - breadcrumbs → breadcrumbs subcollection
 */

import { db } from '../_scripts/lib/firebase.js';

const HISTORY_PAGE_ID = 'historyPage';

async function migrateRemainingSections() {
  try {
    console.log('🚀 Starting remaining sections migration...\n');

    const pageRef = db.collection('pages').doc(HISTORY_PAGE_ID);
    const pageSnap = await pageRef.get();

    if (!pageSnap.exists) {
      console.error(`❌ Document pages/${HISTORY_PAGE_ID} does not exist!`);
      process.exit(1);
    }

    const pageData = pageSnap.data();
    let migrated = 0;

    // 1. Migrate Related Posts
    if (pageData.relatedPosts && Array.isArray(pageData.relatedPosts) && pageData.relatedPosts.length > 0) {
      console.log('📚 Migrating related posts...');
      const relatedPostsRef = pageRef.collection('relatedPosts');
      const existingPosts = await relatedPostsRef.get();
      
      if (existingPosts.size === 0) {
        // Add title as a main document
        if (pageData.relatedPostsTitle) {
          await relatedPostsRef.doc('main').set({
            title: pageData.relatedPostsTitle,
            order: -1 // Before posts
          });
        }
        
        // Add each post as a separate document with order
        for (let i = 0; i < pageData.relatedPosts.length; i++) {
          const post = pageData.relatedPosts[i];
          await relatedPostsRef.doc(`post-${i + 1}`).set({
            ...post,
            order: i
          });
        }
        console.log(`   ✓ Created ${pageData.relatedPosts.length} related posts${pageData.relatedPostsTitle ? ` with title: "${pageData.relatedPostsTitle}"` : ''}`);
        migrated++;
      } else {
        console.log('   ℹ️  Related posts subcollection already exists');
      }
    }

    // 2. Migrate SEO
    if (pageData.seo && typeof pageData.seo === 'object') {
      console.log('🔍 Migrating SEO data...');
      const seoRef = pageRef.collection('seo').doc('main');
      const existingSeo = await seoRef.get();
      
      if (!existingSeo.exists) {
        await seoRef.set({
          ...pageData.seo,
          order: 0
        });
        console.log('   ✓ Created SEO metadata');
        migrated++;
      } else {
        console.log('   ℹ️  SEO subcollection already exists');
      }
    }

    // 3. Migrate Next Up Preview
    if (pageData.nextUpPreview && typeof pageData.nextUpPreview === 'object') {
      console.log('⏭️  Migrating next up preview...');
      const nextUpRef = pageRef.collection('nextUpPreview').doc('main');
      const existingNextUp = await nextUpRef.get();
      
      if (!existingNextUp.exists) {
        await nextUpRef.set({
          ...pageData.nextUpPreview,
          order: 0
        });
        console.log('   ✓ Created next up preview');
        migrated++;
      } else {
        console.log('   ℹ️  Next up preview subcollection already exists');
      }
    }

    // 4. Migrate Labels
    if (pageData.labels && typeof pageData.labels === 'object') {
      console.log('🏷️  Migrating labels...');
      const labelsRef = pageRef.collection('labels').doc('main');
      const existingLabels = await labelsRef.get();
      
      if (!existingLabels.exists) {
        await labelsRef.set({
          ...pageData.labels,
          order: 0
        });
        console.log('   ✓ Created labels');
        migrated++;
      } else {
        console.log('   ℹ️  Labels subcollection already exists');
      }
    }

    // 5. Migrate Breadcrumbs
    if (pageData.breadcrumbs && Array.isArray(pageData.breadcrumbs) && pageData.breadcrumbs.length > 0) {
      console.log('🍞 Migrating breadcrumbs...');
      const breadcrumbsRef = pageRef.collection('breadcrumbs');
      const existingBreadcrumbs = await breadcrumbsRef.get();
      
      if (existingBreadcrumbs.size === 0) {
        // Add each breadcrumb as a separate document with order
        for (let i = 0; i < pageData.breadcrumbs.length; i++) {
          const crumb = pageData.breadcrumbs[i];
          await breadcrumbsRef.doc(`crumb-${i + 1}`).set({
            ...crumb,
            order: i
          });
        }
        console.log(`   ✓ Created ${pageData.breadcrumbs.length} breadcrumbs`);
        migrated++;
      } else {
        console.log('   ℹ️  Breadcrumbs subcollection already exists');
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
migrateRemainingSections()
  .then(() => {
    console.log('✨ Migration script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

