/**
 * Cleanup script: Remove unwanted keyFacts entries
 */

import { db } from '../_scripts/lib/firebase.js';

const HISTORY_PAGE_ID = 'historyPage';
const KEY_FACTS_COLLECTION = 'keyFacts';

async function cleanupKeyFacts() {
  try {
    console.log('🧹 Cleaning up keyFacts subcollection...\n');

    const pageRef = db.collection('pages').doc(HISTORY_PAGE_ID);
    const keyFactsColRef = pageRef.collection(KEY_FACTS_COLLECTION);
    const allDocs = await keyFactsColRef.get();

    const unwantedLabels = ['read time', 'readtime'];
    let deleted = 0;

    for (const docSnap of allDocs.docs) {
      const data = docSnap.data();
      const label = data.label?.toLowerCase().trim();
      
      if (unwantedLabels.includes(label)) {
        await docSnap.ref.delete();
        console.log(`   ✗ Deleted: ${data.label}`);
        deleted++;
      }
    }

    if (deleted === 0) {
      console.log('   ✓ No unwanted entries found.\n');
    } else {
      console.log(`\n✅ Deleted ${deleted} unwanted keyFact(s).\n`);
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

cleanupKeyFacts()
  .then(() => {
    console.log('✨ Cleanup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });











