/**
 * Migration script: Move keyFacts from historyPage document field to keyFacts subcollection
 * 
 * This script:
 * 1. Reads keyFacts array from pages/historyPage document
 * 2. Creates keyFacts subcollection under historyPage
 * 3. Creates documents in subcollection with order field
 * 4. Optionally removes the old keyFacts field from the document
 */

import { db } from '../_scripts/lib/firebase.js';
import { collection, doc, getDoc, getDocs, setDoc, deleteField, updateDoc } from 'firebase/firestore';

const HISTORY_PAGE_ID = 'historyPage';
const KEY_FACTS_COLLECTION = 'keyFacts';

async function migrateKeyFacts() {
  try {
    console.log('🚀 Starting keyFacts migration...\n');

    // Get the historyPage document
    const pageRef = doc(db, 'pages', HISTORY_PAGE_ID);
    const pageSnap = await getDoc(pageRef);

    if (!pageSnap.exists()) {
      console.error(`❌ Document pages/${HISTORY_PAGE_ID} does not exist!`);
      process.exit(1);
    }

    const pageData = pageSnap.data();
    const existingKeyFacts = pageData.keyFacts;

    if (!existingKeyFacts) {
      console.log('ℹ️  No keyFacts field found in historyPage document.');
      console.log('   You can add keyFacts manually in Firebase Console or use the seed script.\n');
      return;
    }

    console.log(`📋 Found ${Array.isArray(existingKeyFacts) ? existingKeyFacts.length : 'object'} keyFacts in document\n`);

    // Normalize to array format
    let factsArray = [];
    if (Array.isArray(existingKeyFacts)) {
      factsArray = existingKeyFacts;
    } else if (typeof existingKeyFacts === 'object') {
      factsArray = Object.entries(existingKeyFacts).map(([label, value]) => ({
        label,
        value: String(value)
      }));
    } else {
      console.error('❌ keyFacts field is not in a valid format (array or object)');
      process.exit(1);
    }

    if (factsArray.length === 0) {
      console.log('ℹ️  keyFacts array is empty. Nothing to migrate.\n');
      return;
    }

    // Check if subcollection already exists
    const keyFactsColRef = collection(db, 'pages', HISTORY_PAGE_ID, KEY_FACTS_COLLECTION);
    const existingDocs = await getDocs(keyFactsColRef);
    
    if (existingDocs.size > 0) {
      console.log(`⚠️  Warning: keyFacts subcollection already has ${existingDocs.size} documents.`);
      console.log('   This script will add new documents. Duplicates may occur.\n');
    }

    // Create documents in subcollection
    console.log('📝 Creating documents in keyFacts subcollection...\n');
    const promises = factsArray.map(async (fact, index) => {
      const factId = fact.id || `fact-${index}`;
      const factRef = doc(db, 'pages', HISTORY_PAGE_ID, KEY_FACTS_COLLECTION, factId);
      
      const factData = {
        label: fact.label || '',
        value: fact.value || '',
        order: fact.order !== undefined ? fact.order : index
      };

      await setDoc(factRef, factData);
      console.log(`   ✓ Created: ${factData.label} = ${factData.value}`);
      return factData;
    });

    await Promise.all(promises);
    console.log(`\n✅ Successfully migrated ${factsArray.length} keyFacts to subcollection!\n`);

    // Ask if user wants to remove old field (commented out for safety)
    console.log('ℹ️  Migration complete! The old keyFacts field is still in the document.');
    console.log('   You can manually remove it from Firebase Console if desired.\n');
    console.log('   To remove programmatically, uncomment the code below:\n');
    console.log('   // await updateDoc(pageRef, { keyFacts: deleteField() });\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateKeyFacts()
  .then(() => {
    console.log('✨ Migration script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

