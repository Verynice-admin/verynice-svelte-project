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

const okzhetpesContent = `
# The Arrow That Could Not Reach

Okzhetpes Rock is the defining icon of Burabay National Park, a granite titan rising 300 meters straight out of the water of Lake Auliekol. Its name is a legend in itself, translating from Kazakh as "The Arrow Cannot Reach."

The story goes that the great Khan Ablai once held a beautiful captive who refused to marry any of his warriors. She climbed to the very peak of this rock and tied her handkerchief to the top, declaring she would only marry the man whose arrow could hit it. Hundreds tried, but the rock was so tall that every arrow fell short. She eventually threw herself into the lake to escape, transforming into the Zhumbaktas rock, but Okzhetpes remains as a symbol of her unreachable spirit and dignity.

# The Stone Menagerie

Okzhetpes is not just a single peak but a gallery of geological sculptures carved by wind and time. Most famous among them is the "Elephant," a rock formation near the summit that looks uncannily like a mammoth or elephant drinking from the lake.

From other angles, visitors claim to see the profile of a woman with flowing hair or a warrior peering out over the steppe. The rock is a Rorschach test for nature lovers, shifting its shape as the light changes across the granite face.

# The Sphinx of the Lake

Just a few hundred meters from the base of Okzhetpes lies the mysterious Zhumbaktas, or "Puzzle Rock." Rising from the middle of the lake, this solitary geological oddity is known as the "Sphinx of Borovoe."

It is famous for its shapeshifting ability. Approached from one side, it looks like a young girl with her hair blowing in the wind. As your boat circles around, the face ages before your eyes, transforming into a wizened old woman (often identified as the witch Baba Yaga). It is a favorite spot for boaters and photographers, offering a magical, almost supernatural experience on the water.

# A Climber's Challenge

While the top of Okzhetpes is technically accessible, it is a perilous climb that requires experience and equipment. For most visitors, the best way to experience its grandeur is from the observation decks at its base or from a boat on the lake, where the sheer size of the "Unreachable" rock can be truly appreciated against the backdrop of the "Blue Mountain" (Kokshetau).
`;

async function renovateOkzhetpes() {
    const db = await initFirebase();
    console.log('🚀 Starting Okzhetpes & Zhumbaktas Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    // Search ALL regions
    const regionsSnap = await regionsRef.get();

    let attractionDoc = null;
    let regionTitle = '';

    for (const regionDoc of regionsSnap.docs) {
        const attractionsRef = regionDoc.ref.collection('attractions');
        const snap = await attractionsRef.where('title', '>=', 'Okzhetpes').where('title', '<=', 'Okzhetpes\uf8ff').get();

        if (!snap.empty) {
            attractionDoc = snap.docs[0];
            regionTitle = regionDoc.data().title;
            break;
        }

        // Fuzzy
        if (!attractionDoc) {
            const all = await attractionsRef.get();
            const found = all.docs.find(d => {
                const t = d.data().title.toLowerCase();
                return (t.includes('okzhetpes') || t.includes('zhumbaktas'));
            });
            if (found) {
                attractionDoc = found;
                regionTitle = regionDoc.data().title;
                break;
            }
        }
    }

    if (!attractionDoc) {
        console.error('❌ Okzhetpes attraction not found!');
        return;
    }

    await updateAttraction(attractionDoc, regionTitle);
}

async function updateAttraction(doc, region) {
    console.log(`✅ Found Rock in [${region}]: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: okzhetpesContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovateOkzhetpes().catch(console.error);
