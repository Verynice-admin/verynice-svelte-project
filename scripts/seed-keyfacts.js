/**
 * Seed script: Populate keyFacts subcollection for historyPage
 * 
 * This script creates/updates keyFacts documents in the keyFacts subcollection
 * under pages/historyPage
 */

import { db } from '../_scripts/lib/firebase.js';
import { collection, doc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';

const HISTORY_PAGE_ID = 'historyPage';
const KEY_FACTS_COLLECTION = 'keyFacts';

// Complete key facts data - includes all facts from the codebase
const DEFAULT_KEY_FACTS = [
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

async function seedKeyFacts() {
  try {
    console.log('🚀 Starting keyFacts seeding...\n');

    const keyFactsColRef = collection(db, 'pages', HISTORY_PAGE_ID, KEY_FACTS_COLLECTION);

    // Check existing documents
    const existingQuery = query(keyFactsColRef, orderBy('order', 'asc'));
    const existingDocs = await getDocs(existingQuery);

    if (existingDocs.size > 0) {
      console.log(`⚠️  Warning: keyFacts subcollection already has ${existingDocs.size} documents.`);
      console.log('   This will update/create documents. Existing ones may be overwritten.\n');
    }

    // Create/update documents
    console.log('📝 Seeding keyFacts subcollection...\n');
    const promises = DEFAULT_KEY_FACTS.map(async (fact) => {
      // Use label as ID (sanitized) or generate ID
      const factId = fact.label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `fact-${fact.order}`;

      const factRef = doc(db, 'pages', HISTORY_PAGE_ID, KEY_FACTS_COLLECTION, factId);

      await setDoc(factRef, {
        label: fact.label,
        value: fact.value,
        order: fact.order
      }, { merge: true });

      console.log(`   ✓ ${fact.label}: ${fact.value}`);
      return factId;
    });

    await Promise.all(promises);
    console.log(`\n✅ Successfully seeded ${DEFAULT_KEY_FACTS.length} keyFacts!\n`);

    // Verify
    const verifyDocs = await getDocs(existingQuery);
    console.log(`📊 Verification: ${verifyDocs.size} documents in subcollection\n`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedKeyFacts()
  .then(() => {
    console.log('✨ Seeding script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

