const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { readFileSync, existsSync } = require('node:fs');
const { resolve } = require('node:path');

function loadServiceAccount() {
  const secretsPaths = [
    resolve('.secrets/serviceAccountKey.json'),
    resolve('.secrets/service-account.json')
  ];

  for (const secretsPath of secretsPaths) {
    try {
      if (existsSync(secretsPath)) {
        const sa = JSON.parse(readFileSync(secretsPath, 'utf8'));
        if (typeof sa.private_key === 'string' && sa.private_key.includes('\\n')) {
          sa.private_key = sa.private_key.replace(/\\n/g, '\n');
        }
        return sa;
      }
    } catch (error) {
      console.log(`Could not load from ${secretsPath}`);
    }
  }
  return null;
}

async function addOrchestrasSection() {
  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    console.error('Could not load service account. Make sure .secrets/serviceAccountKey.json exists');
    process.exit(1);
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
  }

  const db = getFirestore();

  try {
    const docRef = db.collection('pages').doc('heritage').collection('articles').doc('kazakh-melodies');
    const sectionsRef = docRef.collection('sections');

    // Add the orchestras-ensembles section
    await sectionsRef.doc('orchestras-ensembles').set({
      order: 6,
      title: 'Orchestras & Ensembles',
      description: 'World-class orchestras preserving and performing Kazakh musical heritage.',
      imagePublicId: 'content/site/backgrounds/attractions-hero',
      contentMarkdown: `Kazakhstan's orchestras and ensembles represent the pinnacle of musical excellence, blending traditional folk instruments with classical training to create unique soundscapes that captivate audiences worldwide.

**Kurmangazy Kazakh State Orchestra of Folk Instruments** — Named after the legendary dombra composer, this world-renowned orchestra is the crown jewel of Kazakh traditional music. Founded in 1934, it brings together the nation's finest instrumentalists who perform on dombras, kobyzes, syrnays, and other traditional instruments. Their repertoire spans ancient melodies to contemporary compositions, and they have toured internationally, introducing global audiences to the rich tapestry of Kazakh instrumental music.

**Kazakh State Symphony Orchestra** — The nation's premier classical orchestra, established in 1935, performs both Western classical masterpieces and works by Kazakh composers. Their performances often feature pieces that incorporate traditional Kazakh themes and instruments, creating a unique fusion of East and West. The orchestra regularly performs at the Astana Opera and has collaborated with renowned conductors and soloists from around the world.

**Otyrar Sazy** — This legendary folk ensemble, founded in 1980, specializes in recreating and performing ancient Kazakh music. Their research into historical manuscripts and oral traditions has preserved countless melodies that might otherwise have been lost. Using authentic instruments and performance practices, Otyrar Sazy transports listeners back to the time of nomadic bards and epic storytellers.

**Shabyt National Ensemble** — Known for their innovative approach to folk music, Shabyt blends traditional Kazakh instruments with contemporary arrangements. Their performances often feature visual elements and choreography, creating immersive cultural experiences. They have represented Kazakhstan at international festivals and cultural events, winning numerous awards for their artistic excellence.

**Astana Opera Orchestra** — The resident orchestra of the magnificent Astana Opera house, this ensemble performs operas, ballets, and symphonic concerts at one of the world's most acoustically perfect venues. Their repertoire includes both European classics and Kazakh operatic works, such as those by composers like Yerkegali Rakhmadiyev and Mukhtar Kulzhanov.`,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✓ Added Orchestras & Ensembles section to Firebase');
    console.log('\n✅ Section added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding section:', error);
    process.exit(1);
  }
}

addOrchestrasSection();
