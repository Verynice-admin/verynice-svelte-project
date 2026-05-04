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

async function replaceAstudio() {
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
    // Update modern-music section (replace A-Studio with Batyrkhan Shukenov)
    const modernRef = db.collection('pages').doc('heritage').collection('articles').doc('kazakh-melodies').collection('sections').doc('modern-music');
    await modernRef.update({
      contentMarkdown: `While rooted in ancient traditions, Kazakh music continues to evolve and captivate global audiences. Today's artists blend traditional sounds with contemporary styles, creating a unique musical identity that resonates worldwide.

**Dimash Kudaibergen** — With a vocal range spanning six octaves, Dimash has become Kazakhstan's most recognized international artist. His ability to seamlessly transition between operatic power and delicate folk sensitivity has earned him fans across Asia, Europe, and the Americas. He regularly incorporates dombra and traditional Kazakh melodies into his performances, introducing millions to his cultural heritage.

**Imanbek** — The DJ and producer who won a Grammy for his remix of "Roses" brought Kazakh electronic music to the global stage. His infectious beats and innovative production techniques have made him one of the most sought-after remix artists worldwide, proving that Kazakh creativity transcends genres.

**Enlik** — This rising star represents the new generation of Kazakh pop, blending traditional vocal techniques with contemporary R&B and pop sensibilities. Her music addresses modern themes while honoring the melodic traditions of her ancestors.

**Dos Mukasan** — Pioneers of Kazakh rock, this legendary band formed in the 1960s and became the voice of a generation. Their fusion of Western rock instrumentation with Kazakh folk themes created an entirely new genre that continues to influence musicians today. Songs like "Kara Suz" remain anthems of Kazakh identity.

**Batyrkhan Shukenov** — The legendary voice that defined Kazakh pop music for generations. As the founder and soul of A-Studio, Batyrkhan's velvet baritone and charismatic stage presence made him a cultural icon across the post-Soviet space. His solo career further cemented his status as one of Kazakhstan's greatest vocalists, with songs like "Dudarai" becoming eternal classics. His ability to infuse pop music with Kazakh soul created a timeless legacy that continues to influence artists today.

**Roza Rymbayeva** — Known as the "Queen of Kazakh Pop," Roza Rymbayeva has been a cultural icon since the 1970s. Her powerful voice and emotional delivery have made her songs timeless classics. She played a crucial role in popularizing Kazakh music throughout the Soviet Union and continues to inspire new generations of performers with her dedication to cultural authenticity.

**The New Wave** — Beyond individual stars, Kazakhstan's music scene is exploding with talent across all genres. From hip-hop artists rapping in Kazakh to indie bands experimenting with traditional throat singing over electronic beats, the country's youth are creating a musical renaissance that honors the past while boldly stepping into the future.`,
      updatedAt: new Date()
    });
    console.log('✓ Replaced A-Studio with Batyrkhan Shukenov in modern-music section');

    console.log('\n✅ Update completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating content:', error);
    process.exit(1);
  }
}

replaceAstudio();
