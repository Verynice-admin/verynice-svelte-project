import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

function loadServiceAccount(): ServiceAccount | null {
  const secretsPaths = [
    resolve('.secrets/serviceAccountKey.json'),
    resolve('.secrets/service-account.json')
  ];

  for (const secretsPath of secretsPaths) {
    try {
      if (existsSync(secretsPath)) {
        const sa: ServiceAccount = JSON.parse(readFileSync(secretsPath, 'utf8'));
        if (typeof sa.private_key === 'string' && sa.private_key.includes('\\n')) {
          sa.private_key = sa.private_key.replace(/\\n/g, '\n');
        }
        return sa;
      }
    } catch (error) {
      console.log('Failed to load from:', secretsPath);
    }
  }
  return null;
}

async function updateTiers() {
  const sa = loadServiceAccount();
  if (!sa) {
    console.error('No service account found');
    return;
  }

  const app = initializeApp({
    credential: cert(sa as any),
    projectId: sa.project_id
  });

  const db = getFirestore(app);

  console.log('Starting tier update...\n');

  // Get the destinations page
  const destPageRef = db.collection('pages').doc('destinationsPage');
  const articlesSnap = await destPageRef.collection('articles').get();

  let totalUpdated = 0;

  for (const articleDoc of articlesSnap.docs) {
    const articleData = articleDoc.data();
    const regionTitle = articleData.title;
    
    console.log(`Processing region: ${regionTitle}`);

    // Get attractions in this article
    const attractionsSnap = await articleDoc.ref.collection('attractions').get();
    let regionUpdated = 0;

    for (const attractionDoc of attractionsSnap.docs) {
      const attractionData = attractionDoc.data();
      const currentTier = attractionData.tier;
      const attractionTitle = attractionData.title;

      // Set all to Tier 1
      if (currentTier !== 1) {
        await attractionDoc.ref.update({ tier: 1 });
        regionUpdated++;
        totalUpdated++;
        console.log(`  ✓ Updated "${attractionTitle}": tier ${currentTier} -> 1`);
      } else {
        console.log(`  - Already tier 1: "${attractionTitle}"`);
      }
    }

    console.log(`  Region "${regionTitle}": ${regionUpdated} attractions updated\n`);
  }

  console.log(`\n✅ Total attractions updated: ${totalUpdated}`);
}

updateTiers().catch(console.error);