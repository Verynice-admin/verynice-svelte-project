// fetch_ids.js (Admin SDK Version - Corrected for all Node.js versions)
import admin from 'firebase-admin';

// --- START OF THE FIX ---
// We will read the file manually and parse it, which is universally compatible.
import { readFileSync } from 'fs';
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json'));
// --- END OF THE FIX ---

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * A generic function to find all fields ending with "PublicId" in a collection.
 * @param {string} collectionName - The name of the collection to search (e.g., 'pages', 'authors').
 */
async function fetchPublicIds(collectionName) {
  console.log(`\n🔎 Fetching Public IDs from collection: "${collectionName}"...`);
  
  try {
    const querySnapshot = await db.collection(collectionName).get();
    let foundCount = 0;

    if (querySnapshot.empty) {
      console.log(`- No documents found in the "${collectionName}" collection.`);
      return;
    }

    querySnapshot.forEach(doc => {
      const docData = doc.data();
      let idsFoundInDoc = [];

      // Loop through all fields in the document
      for (const key in docData) {
        // Check if the field name ends with 'PublicId' and has a value
        if (key.endsWith('PublicId') && docData[key]) {
          idsFoundInDoc.push(`\n    - Field: ${key} \n    - ID:    ${docData[key]}`);
          foundCount++;
        }
      }

      // If we found any IDs in this document, print them
      if (idsFoundInDoc.length > 0) {
        console.log(`\n📄 Document: "${doc.id}"`);
        console.log(idsFoundInDoc.join(''));
      }
    });

    if (foundCount === 0) {
        console.log(`- ✅ No fields ending in "PublicId" found in this collection.`);
    }

  } catch (error) {
    console.error(`\n❌ Error fetching from collection "${collectionName}":`, error);
  }
}

/**
 * Main function to run our fetchers.
 */
async function runFetcher() {
  console.log('--- Starting Cloudinary Public ID Fetcher ---');
  
  // You can add more collections here as your project grows
  await fetchPublicIds('pages');
  // await fetchPublicIds('authors'); 
  // await fetchPublicIds('destinations');

  console.log('\n--- Fetcher finished ---');
}

// Run the script
runFetcher();