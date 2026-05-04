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

async function addAitysSection() {
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

    // Add the kazakh-aitys section
    await sectionsRef.doc('kazakh-aitys').set({
      order: 7,
      title: 'Kazakh Aitys — The Art of Improvisation',
      description: 'The ancient tradition of competitive singing and poetic duels.',
      imagePublicId: 'content/pages/heritage/kazakhMelodies/aitys',
      contentMarkdown: `**Aitys** is one of Kazakhstan's most vibrant and entertaining musical traditions — a competitive art form where two performers, known as **aityskers**, engage in a spontaneous battle of wits, poetry, and song. Part debate, part concert, part comedy show, Aitys represents the pinnacle of Kazakh oral improvisation.

**The Duel of Minds** — Two aityskers face each other, accompanied by dombra players, and take turns delivering improvised verses. They must respond to each other's arguments, counter with sharp wit, and entertain the audience simultaneously. Topics range from philosophical questions about life and love to playful teasing and social commentary. The competitors must think, rhyme, and sing in real-time, creating a thrilling spectacle of mental agility.

**The Performers** — Aityskers are highly respected artists who spend years mastering their craft. They must have:
- ** encyclopedic knowledge** of traditional poetry, proverbs, and folklore
- **Musical virtuosity** to accompany themselves on the dombra while singing
- **Quick wit** to craft clever responses in seconds
- **Stage presence** to captivate and entertain thousands

**Famous Competitions** — Traditional Aitys competitions draw massive crowds, especially during Nauryz celebrations and other festivals. The national Aitys competitions feature the country's best performers competing for prestige and prizes. Audiences cheer for their favorites as the performers trade increasingly clever and entertaining verses.

**Modern Aitys** — While rooted in ancient tradition, Aitys continues to evolve. Contemporary aityskers incorporate modern themes, social issues, and even humor about daily life. Television and internet broadcasts have brought Aitys to new generations, ensuring this unique art form remains a living, breathing part of Kazakh culture.`,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✓ Added Kazakh Aitys section to Firebase');
    console.log('\n✅ Section added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding section:', error);
    process.exit(1);
  }
}

addAitysSection();
