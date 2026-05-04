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

async function checkTiers() {
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

  console.log('Checking current tier values in Firebase...\n');

  // Get the destinations page
  const destPageRef = db.collection('pages').doc('destinationsPage');
  const articlesSnap = await destPageRef.collection('articles').get();

  const tierCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0 };

  for (const articleDoc of articlesSnap.docs) {
    const articleData = articleDoc.data();
    const regionTitle = articleData.title;
    console.log(`Region: ${regionTitle}`);

    // Get attractions in this article
    const attractionsSnap = await articleDoc.ref.collection('attractions').get();

    for (const attractionDoc of attractionsSnap.docs) {
      const attractionData = attractionDoc.data();
      const tier = attractionData.tier || 0;
      const title = attractionData.title;
      
      if (tier >= 1 && tier <= 3) {
        tierCounts[tier]++;
      }
      
      console.log(`  - ${title}: tier ${tier}`);
    }
    console.log('');
  }

  console.log('=== Tier Distribution ===');
  console.log(`Tier 1: ${tierCounts[1]}`);
  console.log(`Tier 2: ${tierCounts[2]}`);
  console.log(`Tier 3: ${tierCounts[3]}`);
  console.log(`Total: ${tierCounts[1] + tierCounts[2] + tierCounts[3]}`);
}

checkTiers().catch(console.error);