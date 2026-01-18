const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initFirebase() {
    if (admin.apps.length) return admin.firestore();
    let sa;
    if (fs.existsSync(path.resolve('.secrets/serviceAccountKey.json'))) {
        sa = JSON.parse(fs.readFileSync(path.resolve('.secrets/serviceAccountKey.json'), 'utf8'));
    }
    if (!sa) throw new Error('No service account');
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    return admin.firestore();
}

const hazratContent = `
# The "Pearl" of the City

Before the colossal Astana Grand Mosque was built, the Hazrat Sultan Mosque held the title of the largest mosque in Central Asia, and it remains arguably the most beautiful in terms of classical elegance. Opened in 2012, it is often called the "Pearl of the City." Situated on the Right Bank of the Ishim River, its pristine white façade serves as a stunning counterpoint to the high-tech, glass-heavy architecture of the modern administrative district.

The mosque is named "Hazrat Sultan" (The Holy Sultan), which is the reverent epithet of the Sufi sheikh Khoja Ahmed Yasawi. It stands as a spiritual anchor, connecting the modern capital with the deep mystical roots of Turkic Islam.

# A Masterpiece of Classical Islamic Design

While newer mosques experiment with futuristic forms, Hazrat Sultan is a triumph of classical Islamic architecture, seamlessly blended with traditional Kazakh ornamentation. The building is crowned by the largest dome in Kazakhstan, which soars to a height of 51 meters and has a diameter of nearly 30 meters. This central dome is surrounded by eight smaller "onion" domes and framed by four graceful minarets, each reaching 77 meters into the sky.

The exterior is clad in white marble, which glows softly in the sunlight and takes on an ethereal quality at night. Up close, the walls are adorned with intricate "kochkar-muiz" (ram's horn) patterns, a traditional Kazakh motif that grounds the religious structure in the local cultural identity.

# Inside the Sanctuary

The interior of Hazrat Sultan is breathtaking in its detail. The main prayer hall fits 5,000 worshippers, and the entire complex can accommodate up to 10,000 people on holy days. The soaring ceilings are supported by massive white columns, and the space is illuminated by a gigantic 3-ton crystal chandelier.

The walls are decorated with delicate Arabic calligraphy and soft floral patterns in shades of cyan, gold, and white, creating an atmosphere of profound peace. It is not just a place for prayer but a center of community life, featuring halls for weddings, a library, and classrooms for Quranic study.

# A Welcoming Landmark

Like all great mosques in Kazakhstan, Hazrat Sultan is open to visitors of all faiths. Tourists are welcome to enter, admire the architecture, and experience the serenity of the space (provided they dress modestly). Standing in the center of the vast hall, under the great dome, offers a moment of quiet reflection that contrasts sharply with the busy pace of the capital outside.
`;

async function renovateHazratSultan() {
    const db = await initFirebase();
    console.log('🚀 Starting Hazrat Sultan Mosque Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.error('❌ Astana region not found!');
        return;
    }

    const regionDoc = snapshot.docs[0];
    const attractionsRef = regionDoc.ref.collection('attractions');

    // Search for Hazrat Sultan
    let snap = await attractionsRef.where('title', '>=', 'Hazrat Sultan').where('title', '<=', 'Hazrat Sultan\uf8ff').get();

    if (snap.empty) {
        console.error('❌ Hazrat Sultan attraction not found!');
        // Fuzzy
        const all = await attractionsRef.get();
        const found = all.docs.find(d => {
            const t = d.data().title.toLowerCase();
            return (t.includes('hazrat') && t.includes('sultan'));
        });

        if (found) {
            console.log(`⚠️ Found fuzzy match: ${found.data().title}`);
            await updateAttraction(found);
        } else {
            console.log('Attraction truly missing.');
        }
        return;
    }

    const doc = snap.docs[0];
    await updateAttraction(doc);
}

async function updateAttraction(doc) {
    console.log(`✅ Found Hazrat Sultan: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: hazratContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovateHazratSultan().catch(console.error);
