/**
 * Complete setup script: Migrate existing keyFacts AND seed all default facts
 * 
 * This script:
 * 1. Migrates existing keyFacts from document field to subcollection
 * 2. Adds all default key facts (including missing ones like "Origin of Apples")
 * 3. Prevents duplicates
 * 4. Ensures proper ordering
 */

import { db } from '../_scripts/lib/firebase.js';

const HISTORY_PAGE_ID = 'historyPage';
const KEY_FACTS_COLLECTION = 'keyFacts';

// Complete list of all key facts (including Origin of Apples)
const ALL_KEY_FACTS = [
  { label: 'Timeline', value: '3500 BCE - Present', order: 0 },
  { label: 'Key Empires', value: 'Saka, Huns, Golden Horde', order: 1 },
  { label: 'Nation Founded', value: '1465 (Kazakh Khanate)', order: 2 },
  { label: 'Independence', value: '1991', order: 3 },
  { label: 'Legacy', value: 'Domestication of the Horse', order: 4 },
  { label: 'Capital', value: 'Astana', order: 5 },
  { label: 'Official language', value: 'Kazakh', order: 6 },
  { label: 'Spaceport', value: 'Baikonur Cosmodrome (world\'s first)', order: 7 },
  { label: 'First human spaceflight', value: 'Yuri Gagarin (1961) from Baikonur', order: 8 },
  { label: 'Land Area', value: '9th largest country in the world', order: 9 },
  { label: 'Origin of Apples', value: 'Almaty Region (Malus sieversii)', order: 10 }
];

function sanitizeId(label) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'fact';
}

async function setupKeyFacts() {
  try {
    console.log('🚀 Starting complete keyFacts setup...\n');

    // Step 1: Get existing keyFacts from document
    const pageRef = db.collection('pages').doc(HISTORY_PAGE_ID);
    const pageSnap = await pageRef.get();

    if (!pageSnap.exists) {
      console.error(`❌ Document pages/${HISTORY_PAGE_ID} does not exist!`);
      process.exit(1);
    }

    const pageData = pageSnap.data();
    const existingKeyFactsField = pageData.keyFacts;

    // Step 2: Get existing keyFacts from subcollection
    const keyFactsColRef = pageRef.collection(KEY_FACTS_COLLECTION);
    const existingDocs = await keyFactsColRef.orderBy('order', 'asc').get();

    console.log(`📊 Current state:`);
    console.log(`   - Document field: ${existingKeyFactsField ? (Array.isArray(existingKeyFactsField) ? existingKeyFactsField.length : 'object') : 'none'} keyFacts`);
    console.log(`   - Subcollection: ${existingDocs.size} documents\n`);

    // Step 3: Collect all facts to add
    const factsToAdd = new Map(); // Use Map to prevent duplicates by label

    // Add facts from document field (if exists)
    if (existingKeyFactsField) {
      let factsArray = [];
      if (Array.isArray(existingKeyFactsField)) {
        factsArray = existingKeyFactsField;
      } else if (typeof existingKeyFactsField === 'object') {
        factsArray = Object.entries(existingKeyFactsField).map(([label, value]) => ({
          label,
          value: String(value)
        }));
      }

      factsArray.forEach((fact, index) => {
        if (fact.label && fact.value) {
          const key = fact.label.toLowerCase().trim();
          if (!factsToAdd.has(key)) {
            factsToAdd.set(key, {
              label: fact.label.trim(),
              value: String(fact.value).trim(),
              order: fact.order !== undefined ? fact.order : index
            });
          }
        }
      });
      console.log(`   ✓ Loaded ${factsArray.length} facts from document field`);
    }

    // Add all default facts (will overwrite with defaults if duplicate, but preserve order)
    ALL_KEY_FACTS.forEach(fact => {
      const key = fact.label.toLowerCase().trim();
      // Only add if not already present, or update order if present
      if (!factsToAdd.has(key)) {
        factsToAdd.set(key, fact);
      } else {
        // Update order to match default
        const existing = factsToAdd.get(key);
        factsToAdd.set(key, { ...existing, order: fact.order });
      }
    });
    console.log(`   ✓ Added ${ALL_KEY_FACTS.length} default facts\n`);

    // Step 4: Check existing subcollection and merge
    existingDocs.forEach(docSnap => {
      const data = docSnap.data();
      const key = data.label?.toLowerCase().trim();
      if (key && !factsToAdd.has(key)) {
        // Keep existing facts that aren't in our list
        factsToAdd.set(key, {
          label: data.label,
          value: data.value,
          order: data.order !== undefined ? data.order : 999
        });
      }
    });

    // Step 5: Convert to array and sort by order
    const finalFacts = Array.from(factsToAdd.values())
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    console.log(`📝 Creating/updating ${finalFacts.length} documents in keyFacts subcollection...\n`);

    // Step 6: Create/update all documents
    const promises = finalFacts.map(async (fact) => {
      const factId = sanitizeId(fact.label);
      const factRef = keyFactsColRef.doc(factId);

      await factRef.set({
        label: fact.label,
        value: fact.value,
        order: fact.order
      }, { merge: true });

      console.log(`   ✓ ${fact.label}: ${fact.value}`);
      return factId;
    });

    await Promise.all(promises);
    console.log(`\n✅ Successfully created/updated ${finalFacts.length} keyFacts in subcollection!\n`);

    // Step 7: Verify
    const verifyDocs = await keyFactsColRef.orderBy('order', 'asc').get();
    console.log(`📊 Verification: ${verifyDocs.size} documents in subcollection\n`);

    console.log('✨ Setup complete! The keyFacts subcollection is ready.\n');
    console.log('ℹ️  Note: The old keyFacts field in the document is still there.');
    console.log('   You can manually remove it from Firebase Console if desired.\n');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run setup
setupKeyFacts()
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

