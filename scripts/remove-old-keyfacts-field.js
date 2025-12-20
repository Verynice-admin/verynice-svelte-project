/**
 * Remove old keyFacts field from historyPage document
 * 
 * This script removes the legacy keyFacts array field from the document
 * since all data has been migrated to the keyFacts subcollection
 */

import { db } from '../_scripts/lib/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

const HISTORY_PAGE_ID = 'historyPage';
const KEY_FACTS_COLLECTION = 'keyFacts';

async function removeOldKeyFactsField() {
  try {
    console.log('🧹 Removing old keyFacts field from historyPage document...\n');

    const pageRef = db.collection('pages').doc(HISTORY_PAGE_ID);
    const pageSnap = await pageRef.get();

    if (!pageSnap.exists) {
      console.error(`❌ Document pages/${HISTORY_PAGE_ID} does not exist!`);
      process.exit(1);
    }

    const pageData = pageSnap.data();
    
    // Verify subcollection exists and has data
    const keyFactsColRef = pageRef.collection(KEY_FACTS_COLLECTION);
    const keyFactsDocs = await keyFactsColRef.get();

    if (keyFactsDocs.size === 0) {
      console.error('❌ keyFacts subcollection is empty!');
      console.error('   Please run the setup script first to migrate data.\n');
      process.exit(1);
    }

    console.log(`✓ Verified: keyFacts subcollection has ${keyFactsDocs.size} documents\n`);

    // Check if old field exists
    if (!pageData.keyFacts) {
      console.log('ℹ️  No keyFacts field found in document. Nothing to remove.\n');
      return;
    }

    console.log(`📋 Found keyFacts field with ${Array.isArray(pageData.keyFacts) ? pageData.keyFacts.length : 'object'} items\n`);
    console.log('🗑️  Removing keyFacts field from document...\n');

    // Remove the field using FieldValue.delete()
    await pageRef.update({
      keyFacts: FieldValue.delete()
    });

    console.log('✅ Successfully removed keyFacts field from historyPage document!\n');
    console.log('✨ The keyFacts subcollection is now the single source of truth.\n');

  } catch (error) {
    console.error('❌ Removal failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run removal
removeOldKeyFactsField()
  .then(() => {
    console.log('🎉 Cleanup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });











