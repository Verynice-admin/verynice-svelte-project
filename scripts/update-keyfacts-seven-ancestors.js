/**
 * Update keyFacts: Remove "Read time" and add 7 Ancestors facts
 * 
 * This script:
 * 1. Removes "Read time" entry
 * 2. Adds comprehensive facts about the 7 Ancestors tradition
 */

import { db } from '../_scripts/lib/firebase.js';

const HISTORY_PAGE_ID = 'historyPage';
const KEY_FACTS_COLLECTION = 'keyFacts';

// Facts about 7 Ancestors to add
const SEVEN_ANCESTORS_FACTS = [
  {
    label: '7 Ancestors Tradition',
    value: 'Kazakhs trace lineage through 7 generations (7 ata)',
    order: 11
  },
  {
    label: 'Purpose of 7 Ancestors',
    value: 'Ensures genetic diversity and prevents inbreeding in marriages',
    order: 12
  },
  {
    label: 'Marriage Requirement',
    value: 'Couples must verify they share no common ancestors within 7 generations',
    order: 13
  },
  {
    label: 'Health Benefits',
    value: 'Reduces risk of genetic disorders and ensures healthier offspring',
    order: 14
  },
  {
    label: 'Cultural Significance',
    value: 'Preserves family honor and maintains strong clan identity',
    order: 15
  },
  {
    label: 'Historical Practice',
    value: 'Ancient tradition passed down through oral history and genealogical records',
    order: 16
  },
  {
    label: 'Modern Application',
    value: 'Still practiced today, especially in traditional Kazakh communities',
    order: 17
  }
];

async function updateKeyFacts() {
  try {
    console.log('🔄 Updating keyFacts subcollection...\n');

    const pageRef = db.collection('pages').doc(HISTORY_PAGE_ID);
    const keyFactsColRef = pageRef.collection(KEY_FACTS_COLLECTION);
    const allDocs = await keyFactsColRef.get();

    // Step 1: Remove "Read time" entries
    console.log('🗑️  Removing "Read time" entries...\n');
    let deleted = 0;
    const unwantedLabels = ['read time', 'readtime', 'read time minutes'];
    
    for (const docSnap of allDocs.docs) {
      const data = docSnap.data();
      const label = data.label?.toLowerCase().trim();
      
      if (unwantedLabels.some(unwanted => label.includes(unwanted))) {
        await docSnap.ref.delete();
        console.log(`   ✗ Deleted: ${data.label}`);
        deleted++;
      }
    }

    if (deleted > 0) {
      console.log(`   ✓ Removed ${deleted} "Read time" entry/entries\n`);
    } else {
      console.log('   ✓ No "Read time" entries found\n');
    }

    // Step 2: Check existing 7 Ancestors facts
    const existingDocs = await keyFactsColRef.get();
    const existingLabels = new Set();
    existingDocs.forEach(doc => {
      const label = doc.data().label?.toLowerCase().trim();
      if (label) existingLabels.add(label);
    });

    // Step 3: Add 7 Ancestors facts
    console.log('➕ Adding 7 Ancestors facts...\n');
    let added = 0;
    let updated = 0;

    for (const fact of SEVEN_ANCESTORS_FACTS) {
      const factId = fact.label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      const factRef = keyFactsColRef.doc(factId);
      const existing = await factRef.get();
      
      await factRef.set({
        label: fact.label,
        value: fact.value,
        order: fact.order
      }, { merge: true });

      if (existing.exists) {
        console.log(`   ↻ Updated: ${fact.label}`);
        updated++;
      } else {
        console.log(`   ✓ Added: ${fact.label}`);
        added++;
      }
    }

    console.log(`\n✅ Successfully added ${added} new facts and updated ${updated} existing facts!\n`);

    // Step 4: Verify final count
    const finalDocs = await keyFactsColRef.orderBy('order', 'asc').get();
    console.log(`📊 Final count: ${finalDocs.size} keyFacts in subcollection\n`);

    console.log('✨ Update complete!\n');

  } catch (error) {
    console.error('❌ Update failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run update
updateKeyFacts()
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });











