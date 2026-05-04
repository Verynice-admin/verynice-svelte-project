import { initializeApp, cert, getApps } from 'firebase-admin/app';
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
      console.log(`Could not load from ${secretsPath}`);
    }
  }
  return null;
}

// Kazakh Melodies Article
const kazakhMelodiesPage = {
  seo: {
    title: 'Kazakh Melodies | Culture | VeryNice',
    description: 'Explore Kazakh musical traditions, dombra melodies, throat singing, and traditional dances that unite generations.'
  },
  mainTitle: 'Kazakh Melodies',
  headerDescription: 'Kazakh musical traditions echo the sounds of the steppe — the wind through grass, galloping horses, and the human voice expressing love, longing, and heroism.',
  heroKicker: 'Sounds of the Steppe',
  location: 'Kazakhstan',
  articleViews: 0,
  articleLikes: 0,
  articleComments: 0,
  breadcrumbs: [
    { label: 'Home', href: '/' },
    { label: 'Culture', href: '/culture' },
    { label: 'Kazakh Melodies' }
  ],
  headerBackgroundPublicId: 'content/pages/heritage/kazakhMelodies/mainKazakhMelodies'
};

const kazakhMelodiesSections = [
  {
    id: 'the-dombra',
    order: 1,
    title: 'The Dombra — Soul of Kazakh Music',
    description: 'The two-stringed lute that has accompanied nomads for centuries.',
    imagePublicId: 'content/site/backgrounds/attractions-hero',
    contentMarkdown: `The **dombra** is not merely an instrument — it is the soul of Kazakh music, the companion of poets, and the voice of the steppe. This two-stringed lute has accompanied nomads for centuries, filling yurts with melodies that speak of love, heroism, and the eternal connection to land and sky.

**Construction and Design** — The dombra consists of a long, narrow neck and an oval or pear-shaped body carved from a single piece of wood (typically apricot, mulberry, or pine). Two strings made from sheep intestine or nylon stretch from the tuning pegs at the top to the base, producing a bright, resonant sound that carries across open spaces.

**Playing Techniques** — Masters use complex fingerpicking and strumming techniques to create the dombra's distinctive sound. The instrument can imitate natural phenomena — galloping horses, flowing rivers, whistling wind — while also expressing profound human emotions. Advanced players use harmonics, slides, and percussive effects.

**Legendary Masters** —
- **Kurmangazy Sagyrbayev** (1823–1896): The most celebrated dombra composer, his works remain central to Kazakh music
- **Dina Nurpeisova** (1861–1955): A virtuoso who elevated dombra playing to high art
- **Nurgisa Tlendiyev**: Modern master who fused traditional and contemporary styles

**The Dombra in Society** — No celebration, gathering, or long evening was complete without dombra music. The instrument accompanied *Aytis* (poetic competitions), storytelling, and solo performances. A family's dombra was treasured, often passed down through generations.`
  },
  {
    id: 'traditional-instruments',
    order: 2,
    title: 'Traditional Instruments',
    description: 'The diverse soundscape of Kazakh musical culture.',
    imagePublicId: 'content/site/backgrounds/attractions-hero',
    contentMarkdown: `Beyond the dombra, Kazakh musical culture encompasses a diverse array of instruments, each with unique sounds, histories, and ceremonial roles.

**The Kobyz** — An ancient bowed instrument with a sacred history. Its body is covered with camel or goat skin, producing a haunting, resonant tone. In ancient times, Kobyz players (**Kobyzshi**) served as shamans, using the instrument's eerie sounds to communicate with spirits and heal illnesses.

**The Syrnay** — A wooden flute with a breathy, melancholic voice. Pastoralists played Syrnay while watching flocks, its melodies reflecting the vastness of the steppe. Different lengths produce different registers, from high, bird-like calls to deep, wind-like tones.

**The Dauylpaz** — A large frame drum used in ceremonial contexts. Covered with goat skin and played with the hands, it provides the rhythmic foundation for dances and celebrations. Shamans used the Dauylpaz to induce trance states during rituals.

**The Shankobyz** — A metal jaw harp that produces buzzing, otherworldly tones. Small enough to fit in a pocket, it was popular among herders and travelers. By changing mouth shape and breathing, players create complex rhythmic patterns and melodies.

**The Zhetigen** — A seven-stringed instrument similar to a zither, played by plucking the strings open or stopping them with a small stick. It produces a gentle, harp-like sound suitable for intimate gatherings.`
  },
  {
    id: 'traditional-dances',
    order: 3,
    title: 'Traditional Dances',
    description: 'Movement traditions that unite communities and celebrate life.',
    imagePublicId: 'content/site/backgrounds/attractions-hero',
    contentMarkdown: `Kazakh dance traditions range from communal circle dances to competitive sporting displays, each expressing different aspects of nomadic life, relationships, and community bonds.

**Kara Zhorga (Black Earth)** — The most popular group dance, performed at celebrations and gatherings. Participants form circles or lines, performing synchronized steps that mimic horseback riding, herding, and daily activities. The dance builds in energy, with faster music inspiring more animated movements. Everyone is welcome to join, making it a powerful community-building tradition.

**Kyz Kuu (Girl Chasing)** — A playful game-dance performed on horseback. A young woman on horseback starts the race, followed by a young man. If he catches her, she may whip him lightly; if he fails, she chases and whips him. This centuries-old tradition tests horsemanship while providing entertainment and courtship opportunities.`
  },
  {
    id: 'epic-poetry',
    order: 4,
    title: 'Epic Poetry (Zhyr)',
    description: 'The oral tradition that preserves history through performance.',
    imagePublicId: 'content/site/backgrounds/attractions-hero',
    contentMarkdown: `Kazakh epic poetry (**Zhyr**) represents one of the world's great oral traditions. Bards called **Zhyraus** memorize thousands of lines of verse, recounting the deeds of heroes, the wisdom of ancestors, and the history of the Kazakh people.

**The Great Epics** —
- **Manas**: The monumental Kyrgyz-Kazakh epic cycle, over 200,000 lines long, telling of the hero Manas and his descendants who unified tribes
- **Koblandy**: Adventures of a legendary batyr (warrior) who defended his people
- **Alpamys**: The story of a hero who survives betrayal and returns to reclaim his honor
- **Er-Targyn**: Tales of a warrior who protects his people from invaders

**The Art of the Zhyraus** — Becoming a Zhyraus requires years of apprenticeship. Masters teach students not only the words but also the musical performance, vocal techniques, and improvisational skills. A skilled Zhyraus can perform for days, adapting the epic to the occasion and audience.

**Musical Accompaniment** — Epics are performed with dombra or Kobyz accompaniment. The bard alternates between singing and speaking, with music intensifying during action scenes and becoming melancholic during emotional passages.

**Preservation and Revival** — Soviet-era documentation projects recorded hundreds of epic performers. Today, UNESCO recognizes Kazakh oral traditions as Intangible Cultural Heritage. Competitions, festivals, and university programs train new generations of Zhyraus, ensuring these ancient stories continue to echo across the steppe.`
  }
];

async function seedKazakhMelodies() {
  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    console.error('Could not load service account. Make sure .secrets/serviceAccountKey.json exists');
    process.exit(1);
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount as any),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
  }

  const db = getFirestore();

  try {
    // Create the main document
    const docRef = db.collection('pages').doc('heritage').collection('articles').doc('kazakh-melodies');
    await docRef.set({
      ...kazakhMelodiesPage,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✓ Created kazakh-melodies article');

    // Create sections subcollection
    const sectionsRef = docRef.collection('sections');
    for (const section of kazakhMelodiesSections) {
      await sectionsRef.doc(section.id).set({
        order: section.order,
        title: section.title,
        description: section.description,
        imagePublicId: section.imagePublicId,
        contentMarkdown: section.contentMarkdown,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✓ Created section: ${section.id}`);
    }

    console.log('\n✅ Kazakh Melodies article seeded successfully!');
    console.log('Firebase path: pages > heritage > articles > kazakh-melodies');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedKazakhMelodies();
