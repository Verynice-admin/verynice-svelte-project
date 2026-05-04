const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function loadServiceAccount() {
  const candidates = [
    path.resolve('.secrets/serviceAccountKey.json'),
    path.resolve('.secrets/service-account.json'),
    process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS)
      : null,
    path.resolve('serviceAccountKey.json'),
    path.resolve('service-account.json')
  ].filter(Boolean);

  for (const filePath of candidates) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (typeof raw.private_key === 'string' && raw.private_key.includes('\\n')) {
          raw.private_key = raw.private_key.replace(/\\n/g, '\n');
        }
        return raw;
      }
    } catch (_err) {
      // Try next path
    }
  }

  const jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.VITE_FIREBASE_SERVICE_ACCOUNT;
  if (jsonStr) {
    try {
      const raw = JSON.parse(jsonStr);
      if (typeof raw.private_key === 'string' && raw.private_key.includes('\\n')) {
        raw.private_key = raw.private_key.replace(/\\n/g, '\n');
      }
      return raw;
    } catch (_err) {
      return null;
    }
  }

  return null;
}

const PUBLIC_ID_BASE = 'content/pages/foodDrinks/traditionalDastarkhan';

const PAGE_FIELDS = {
  traditionalDastarkhanTitle: 'Traditional Kazakh Dastarkhan',
  traditionalDastarkhanDescription:
    'The full etiquette architecture of the dastarkhan, from honored seating and tabak tartu to tea rhythm, seasonal feasts, and modern urban revival.',
  traditionalDastarkhanHeroKicker: 'Table of Hospitality',
  traditionalDastarkhanHeroPublicId: `${PUBLIC_ID_BASE}/hero`
};

const SECTIONS = [
  {
    id: 'ethos-of-hosting',
    order: 1,
    title: 'Ethos of Hosting',
    description: 'In Kazakh culture, the table is a moral space before it is a menu.',
    imagePublicId: `${PUBLIC_ID_BASE}/sections/ethos-of-hosting`,
    contentMarkdown:
      'The **dastarkhan** is not simply a spread of dishes. It is an ethical performance of care in which the host demonstrates attentiveness, memory, and restraint. A respected host notices who arrived first, who is older, who is visiting from afar, and who should be greeted through food rather than words.\n\nIn this framework, abundance is measured by balance. A table can be rich, yet still feel coarse if service is rushed. A table can be simple, yet still feel noble if each guest is welcomed with precision and warmth. This is why Kazakh families often describe a successful gathering through the atmosphere of the table, not only through what was eaten.\n\nEven iconic foods such as **beshbarmak**, **kazy**, or fresh **baursak** gain their full meaning only inside this etiquette logic. The ritual of offering, refilling, and sequencing is what turns food into tradition.'
  },
  {
    id: 'seating-hierarchy',
    order: 2,
    title: 'Seating Hierarchy and Social Geometry',
    description: 'Placement around the dastarkhan communicates rank, respect, and relationship.',
    imagePublicId: `${PUBLIC_ID_BASE}/sections/seating-hierarchy`,
    contentMarkdown:
      'Traditional seating is deliberate. The most honored position is not ornamental; it marks the person whose presence dignifies the gathering. Elders, spiritual authorities, or senior guests are placed where service reaches them first and where conversation naturally centers around them.\n\nFamily members occupy supportive positions according to responsibility. Those managing the flow of dishes and tea remain close to the service axis. Younger relatives learn by observation, carrying bowls, watching timing, and absorbing the table language that cannot be taught through instruction alone.\n\nThis spatial discipline allows the meal to unfold without friction. Service becomes legible, and everyone understands who should be addressed first, who receives ceremonial cuts, and who leads the emotional tone of the gathering.'
  },
  {
    id: 'serving-order',
    order: 3,
    title: 'Serving Order and Tabak Tartu',
    description: 'The prestige of the dastarkhan is expressed through sequence, not speed.',
    imagePublicId: `${PUBLIC_ID_BASE}/sections/serving-order`,
    contentMarkdown:
      'A classic dastarkhan does not present all dishes at once. It opens with stabilizing gestures, most often tea and light accompaniments, then moves toward its ceremonial center where meat and broth define the emotional peak of the meal.\n\nThe most important mechanism is **tabak tartu**, the structured distribution of meat cuts according to guest status and context. In this moment, familiar dishes from the signature canon become ritual instruments. **Beshbarmak** anchors shared identity, while **kazy**, **shuzhuk**, and **zhaya** operate as signals of honor and seriousness. **Sorpa** restores rhythm and prepares the table for longer conversation.\n\nWhat outsiders sometimes read as just serving is, in fact, a public grammar of respect. The order in which a plate arrives can carry as much meaning as the ingredients on it.'
  },
  {
    id: 'tea-ritual',
    order: 4,
    title: 'Tea Ritual and Conversational Rhythm',
    description: 'Tea is the tempo system of the table, regulating pace and emotional tone.',
    imagePublicId: `${PUBLIC_ID_BASE}/sections/tea-ritual`,
    contentMarkdown:
      'Tea service in Kazakh hosting is an art of timing. Small pours are intentional: they invite continued attention, repeated contact, and a quieter cadence of care. Each refill is a social checkpoint where comfort is reassessed without interruption.\n\nThe tea horizon usually carries **baursak**, dried fruit, nuts, and sweets, but the key element is choreography. Service slows when conversation deepens, accelerates when guests arrive, and pauses when ceremonial speech is being offered. This dynamic pacing is one reason the dastarkhan can sustain long gatherings without fatigue.\n\nFermented drinks such as **kymyz**, **shubat**, and **ayran** may appear according to region and season, yet tea remains the most universal medium of welcome and continuity.'
  },
  {
    id: 'speech-and-etiquette',
    order: 5,
    title: 'Speech Etiquette, Bata, and Table Conduct',
    description: 'Respect is performed through speech discipline as much as through eating.',
    imagePublicId: `${PUBLIC_ID_BASE}/sections/speech-and-etiquette`,
    contentMarkdown:
      'A refined guest listens before speaking, accepts hospitality without theatrical refusal, and follows elder-first cues in both food and conversation. At a traditional table, manners are interpreted as character rather than style.\n\nThe verbal summit of many gatherings is **bata**, the blessing speech that seals gratitude, intention, and collective dignity. Bata is never ornamental; it formalizes the moral purpose of the meal and binds the social moment into memory.\n\nIn this setting, rushing, interrupting service order, or treating the table as a private plate experience is considered a breakdown of form. Proper conduct means joining the shared rhythm rather than asserting personal tempo.'
  },
  {
    id: 'ceremonial-contexts',
    order: 6,
    title: 'Ceremonial Contexts Across Life Events',
    description: 'The dastarkhan adapts to weddings, births, memorials, and seasonal festivals.',
    imagePublicId: `${PUBLIC_ID_BASE}/sections/ceremonial-contexts`,
    contentMarkdown:
      'The same etiquette architecture appears in different ceremonial moods. Wedding-related gatherings expand the meat program and lengthen the tea horizon to honor alliances between families. Birth celebrations emphasize continuity and blessing, often placing elder women at the center of ritual authority.\n\nMemorial tables are usually more restrained in tone, yet no less precise in service order. Respectful pacing, measured speech, and carefully sequenced offerings become the language of remembrance.\n\nDuring **Nauryz**, symbolic foods such as **nauryz kozhe** reinforce renewal, but the underlying code does not change. The table still communicates order, gratitude, and collective dignity.'
  },
  {
    id: 'modern-practice',
    order: 7,
    title: 'Modern Urban Dastarkhan and Cultural Revival',
    description: 'Contemporary venues reinterpret tradition while preserving ceremonial logic.',
    imagePublicId: `${PUBLIC_ID_BASE}/sections/modern-practice`,
    contentMarkdown:
      'In Almaty and Astana, contemporary restaurants are rebuilding dastarkhan culture through design, pacing, and narrative service. Plating may look modern, yet the underlying sequence often mirrors classical protocol: honor first, center service, then extended tea.\n\nChefs increasingly frame signature dishes through story. **Beshbarmak** may arrive with commentary on regional style; **kazy** may be introduced as ceremonial meat rather than a generic sausage; tea service may be staged to recover the old rhythm of attention. This translation work helps younger urban audiences reconnect with table meaning.\n\nThe strongest modern examples do not reduce tradition to decoration. They preserve the core principle that hospitality is a disciplined cultural act, and that the table is where memory, hierarchy, and generosity become visible.'
  }
];

async function seed() {
  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    console.error('No Firebase service account found. Add one to .secrets/ or set GOOGLE_APPLICATION_CREDENTIALS.');
    process.exit(1);
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
    });
  }

  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const pageRef = db.collection('pages').doc('restaurantsPage');

  console.log('Seeding traditional dastarkhan sections into pages/restaurantsPage...');

  await pageRef.set(
    {
      ...PAGE_FIELDS,
      updatedAt: now
    },
    { merge: true }
  );

  const batch = db.batch();

  for (const section of SECTIONS) {
    const sectionRef = pageRef.collection('traditionalDastarkhanSections').doc(section.id);
    batch.set(
      sectionRef,
      {
        ...section,
        updatedAt: now
      },
      { merge: true }
    );
  }

  const traditionalRestaurantRef = pageRef.collection('restaurants').doc('traditional-dastarkhan');
  batch.set(
    traditionalRestaurantRef,
    {
      id: 'traditional-dastarkhan',
      title: 'Traditional Dastarkhan',
      city: 'Almaty',
      description: 'Classic Kazakh menu, live music, and generous platters.',
      href: '/food-drink/traditional-dastarkhan',
      updatedAt: now
    },
    { merge: true }
  );

  await batch.commit();

  const expectedSectionIds = new Set(SECTIONS.map((section) => section.id));
  const sectionsSnap = await pageRef.collection('traditionalDastarkhanSections').get();
  const legacySectionDocs = sectionsSnap.docs.filter((doc) => !expectedSectionIds.has(doc.id));
  if (legacySectionDocs.length > 0) {
    const cleanupBatch = db.batch();
    legacySectionDocs.forEach((doc) => cleanupBatch.delete(doc.ref));
    await cleanupBatch.commit();
    console.log(`Deleted ${legacySectionDocs.length} legacy section docs from traditionalDastarkhanSections.`);
  }

  const oldEntriesSnap = await pageRef.collection('traditionalDastarkhan').get();
  if (!oldEntriesSnap.empty) {
    const deleteBatch = db.batch();
    oldEntriesSnap.docs.forEach((doc) => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();
    console.log(`Deleted ${oldEntriesSnap.size} old entry docs from traditionalDastarkhan.`);
  }

  console.log(
    `Done. Seeded ${SECTIONS.length} ritual sections and updated traditional-dastarkhan restaurant link.`
  );
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
