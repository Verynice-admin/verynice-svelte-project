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

// Original tier values from backups
const ORIGINAL_TIERS: Record<string, number> = {
  // Almaty & Nearby
  'ak-bulak-ski-resort': 3,
  'aktau-mountains': 1,
  'almaty-botanical-garden': 2,
  'almaty-central-park': 2,
  'almaty-city': 3,  // City - set to 1
  'almaty-metro': 3,
  'almaty-opera-house': 2,
  'almaty-river-promenade': 3,
  'almaty-zoo': 2,
  'altyn-emel-national-park': 1,
  'arbat-almaty': 2,
  'assy-plateau': 2,
  'atakent-exhibition-center': 3,
  'bartogai-reservoir': 2,
  'besshatyr-scythian-mounds': 2,
  'big-almaty-lake': 1,
  'botanical-garden': 2,
  'butakov-waterfall': 2,
  'central-state-museum': 2,
  'charyn-canyon': 1,
  'chundzha-hot-springs': 2,
  'dostyk-park': 3,
  'dzungarian-alatau': 3,
  'dzungarian-alatau-mountains': 3,
  'esentai-tower': 3,
  'furmanov-peak': 2,
  'green-bazaar': 1,
  'ile-alatau-national-park': 2,
  'issyk-lake': 2,
  'kaindy-lake': 1,
  'kapchagay-reservoir': 2,
  'katutau-mountains': 2,
  'kazakhstan-museum-of-arts': 2,
  'khan-tengri-peak': 3,
  'kok-tobe-hill': 1,
  'kok-zhailau': 2,
  'kolsai-lakes': 1,
  'lesnaya-skazka-oy-karagay': 3,
  'medeu': 1,
  'nomad-ethno-village': 2,
  'nursultan-peak': 3,
  'panfilov-park': 2,
  'park-first-president': 2,
  'pobeda-peak': 3,
  'rakhat-candy-factory': 3,
  'respublika-alany': 3,
  'sairan-lake': 3,
  'shymbulak-ski-resort': 1,
  'singing-dune': 1,
  'sunkar-falcon-center': 3,
  'tabagan-ski-resort': 3,
  'talgar-pass': 3,
  'talgar-settlement': 3,
  'tamgaly-tas': 2,
  'tian-shan-mountains': 3,
  'turgen-gorge': 2,
  'zailiysky-alatau': 3,
  'zenkov-cathedral': 1,
  'zharkent-mosque': 2,
  
  // Astana & Nearby
  'ailand-entertainment-complex': 3,
  'ak-orda-presidential-palace': 2,
  'alzhir-memorial': 3,
  'assumption-russian-orthodox-cathedral': 3,
  'astana-botanical-garden': 3,
  'astana-city': 3,  // City - set to 1
  'astana-grand-mosque': 1,
  'astana-opera': 3,
  'atameken-map-kazakhstan': 3,
  'baiterek-tower': 1,
  'buiratau-nature-park-north': 2,
  'burabay-lake': 1,
  'burabay-national-park': 2,
  'hazrat-sultan-mosque': 3,
  'ishim-river-promenade': 3,
  'khan-shatyr': 1,
  'korgalzhyn-nature-reserve': 3,
  'lovers-park': 2,
  'museum-armed-forces': 2,
  'national-museum-kazakhstan': 2,
  'nur-alem-sphere': 1,
  'nur-astana-mosque': 3,
  'nurzhol-boulevard': 3,
  'okzhetpes-rock': 2,
  'palace-of-peace-and-reconciliation': 2,
  'palace-schoolchildren': 2,
  'presidential-park-astana': 2,
  'triumphal-arch-mangilik-el': 3,
  'zerenda-lake': 2,
  
  // East Kazakhstan
  'altai-botanical-garden': 1,
  'altai-mountains': 1,
  'bukhtarma-reservoir': 3,
  'east-kazakhstan': 3,
  'irtysh-river-embankment': 2,
  'katon-karagay-national-park': 1,
  'kiin-kerish': 3,
  'kokkol-waterfall': 3,
  'markakol-lake': 1,
  'mount-belukha': 1,
  'rakhmanov-springs': 2,
  'semipalatinsk-polygon': 3,
  'yazevoe-lake': 2,
  
  // Mangystau Region
  'airakti-castle-valley': 2,
  'aktau': 3,
  'beket-ata-underground-mosque': 1,
  'boszhira-tract': 1,
  'kapamsay-canyon': 2,
  'karagiye-depression': 2,
  'mangystau': 3,
  'shakpak-ata-underground-mosque': 2,
  'sherkala-mountain': 1,
  'torysh-valley-of-balls': 2,
  'ustyurt-plateau': 1,
  
  // Turkistan & Shymkent
  'abay-park-shymkent': 2,
  'abu-nasyr-al-farabi-mosque': 3,
  'aisha-bibi-mausoleum': 1,
  'aksu-canyon': 3,
  'aksu-zhabagly-reserve': 2,
  'akyrtas-archaeological-site': 3,
  'arystan-bab-mausoleum': 1,
  'bechenka-river-canyon': 3,
  'caravanserai-turkistan': 3,
  'domalaq-ana-mausoleum': 3,
  'hilvet-underground-mosque': 3,
  'khoja-ahmed-yasawi-mausoleum': 1,
  'otrar-archaeological-site': 2,
  'qyrgy-bazar': 3,
  'rabia-sultan-begum-mausoleum': 3,
  'sairam-su-lake': 3,
  'sairam-ugam-national-park': 2,
  
  // Other Attractions
  'baikonur-cosmodrome': 1,
  'baikonur-cosmodrome-museum': 1,
  'bayanaul-national-park': 1,
  'botai-settlement': 1,
  'sarayshyq-ancient-settlement': 1,
};

async function restoreTiers() {
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

  console.log('Restoring original tiers...\n');

  const destPageRef = db.collection('pages').doc('destinationsPage');
  const articlesSnap = await destPageRef.collection('articles').get();

  let totalUpdated = 0;

  for (const articleDoc of articlesSnap.docs) {
    const attractionsSnap = await articleDoc.ref.collection('attractions').get();

    for (const attractionDoc of attractionsSnap.docs) {
      const attractionData = attractionDoc.data();
      const id = attractionData.id?.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const title = attractionData.title;
      
      // Try to match by ID or title
      let targetTier = ORIGINAL_TIERS[id];
      
      // Also try matching by title (normalized)
      if (!targetTier && title) {
        const titleKey = title.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        targetTier = ORIGINAL_TIERS[titleKey];
      }
      
      // For city entries specifically - set to 1
      const isCity = title?.toLowerCase().includes('city') && 
                     (title?.toLowerCase().includes('almaty') || title?.toLowerCase().includes('astana'));
      
      if (targetTier !== undefined) {
        const currentTier = attractionData.tier;
        const finalTier = isCity ? 1 : targetTier;
        
        if (currentTier !== finalTier) {
          await attractionDoc.ref.update({ tier: finalTier });
          totalUpdated++;
          console.log(`  ✓ Updated "${title}": tier ${currentTier} -> ${finalTier} (${isCity ? 'city' : 'restored'})`);
        }
      } else if (isCity) {
        // City not in list - set to 1
        await attractionDoc.ref.update({ tier: 1 });
        totalUpdated++;
        console.log(`  ✓ Set city "${title}" to tier 1`);
      }
    }
  }

  console.log(`\n✅ Total attractions updated: ${totalUpdated}`);
}

restoreTiers().catch(console.error);