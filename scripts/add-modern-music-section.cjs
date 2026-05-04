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

async function addModernMusicSection() {
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

    // Add the modern-music section
    await sectionsRef.doc('modern-music').set({
      order: 5,
      title: 'Modern Kazakh Music',
      description: 'Contemporary artists taking Kazakh music to the world stage.',
      imagePublicId: 'content/site/backgrounds/attractions-hero',
      contentMarkdown: `While rooted in ancient traditions, Kazakh music continues to evolve and captivate global audiences. Today's artists blend traditional sounds with contemporary styles, creating a unique musical identity that resonates worldwide.

**Dimash Kudaibergen** — With a vocal range spanning six octaves, Dimash has become Kazakhstan's most recognized international artist. His ability to seamlessly transition between operatic power and delicate folk sensitivity has earned him fans across Asia, Europe, and the Americas. He regularly incorporates dombra and traditional Kazakh melodies into his performances, introducing millions to his cultural heritage.

**Imanbek** — The DJ and producer who won a Grammy for his remix of "Roses" brought Kazakh electronic music to the global stage. His infectious beats and innovative production techniques have made him one of the most sought-after remix artists worldwide, proving that Kazakh creativity transcends genres.

**Enlik** — This rising star represents the new generation of Kazakh pop, blending traditional vocal techniques with contemporary R&B and pop sensibilities. Her music addresses modern themes while honoring the melodic traditions of her ancestors.

**Dos Mukasan** — Pioneers of Kazakh rock, this legendary band formed in the 1960s and became the voice of a generation. Their fusion of Western rock instrumentation with Kazakh folk themes created an entirely new genre that continues to influence musicians today. Songs like "Kara Suz" remain anthems of Kazakh identity.

**A-Studio** — One of Kazakhstan's most beloved pop groups, A-Studio has dominated the charts for decades with their catchy melodies and polished production. Their ability to evolve with changing musical trends while maintaining a distinctly Kazakh sensibility has ensured their lasting popularity.

**The New Wave** — Beyond individual stars, Kazakhstan's music scene is exploding with talent across all genres. From hip-hop artists rapping in Kazakh to indie bands experimenting with traditional throat singing over electronic beats, the country's youth are creating a musical renaissance that honors the past while boldly stepping into the future.`,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✓ Added Modern Kazakh Music section to Firebase');
    console.log('\n✅ Section added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding section:', error);
    process.exit(1);
  }
}

addModernMusicSection();
