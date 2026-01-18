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

const korgalzhynContent = `
# A UNESCO World Heritage Sanctuary

Korgalzhyn Nature Reserve is a place of global ecological significance. Recognized as a UNESCO World Heritage Site under the title "Saryarka – Steppe and Lakes of Northern Kazakhstan," it is also a designated Ramsar wetland of international importance. Located about 130 kilometers southwest of Astana, this vast protected area covers over 500,000 hectares, preserving a pristine slice of the ancient steppe ecosystem that once stretched across the entire continent.

It is a land of dramatic contrasts, where the endless golden grasses of the steppe meet a complex system of fresh and saline lakes, creating a unique habitat that supports an explosion of biodiversity.

# The Kingdom of Pink Flamingos

The reserve's most famous inhabitants are the Greater Flamingos. Korgalzhyn is home to the northernmost breeding colony of these magnificent birds in the world. From April to October, the shallow, saline waters of Lake Tengiz turn a vibrant shade of pink as up to 60,000 flamingos congregate to feed on the brine shrimp that thrive in the salty ecosystem.

Witnessing thousands of these tropical-looking birds against the backdrop of the Central Asian steppe is a surreal and unforgettable experience. It challenges every preconception about what wildlife can be found in this latitude.

# A Birdwatcher's Paradise

Beyond the flamingos, Korgalzhyn is often called a "Bird Bazaar." It lies at the crossroads of major migratory flyways connecting Africa, Europe, and South Asia. Over 350 species of birds have been recorded here, including rare and endangered species like the Dalmatian Pelican, the White-headed Duck, and the Sociable Lapwing.

During migration seasons, millions of birds descend on the lakes to rest and refuel. The air is filled with a cacophony of calls, and the sky is often darkened by massive flocks, making it one of the premier birdwatching destinations in Eurasia.

# The Golden Steppe and Saiga

While the lakes teem with life, the surrounding steppe is equally precious. It is one of the last strongholds of the Saiga antelope, a critically endangered species known for its distinctive bulbous nose. These ancient creatures, which walked the earth alongside mammoths, roam the vast, treeless plains of Korgalzhyn, protected from poachers and habitat loss. The reserve offers a rare glimpse into the wild heart of Kazakhstan, a landscape that has remained virtually unchanged for millennia.
`;

async function renovateKorgalzhyn() {
    const db = await initFirebase();
    console.log('🚀 Starting Korgalzhyn Reserve Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.error('❌ Astana region not found!');
        return;
    }

    const regionDoc = snapshot.docs[0];
    const attractionsRef = regionDoc.ref.collection('attractions');

    // Search for Korgalzhyn
    let snap = await attractionsRef.where('title', '>=', 'Korgalzhyn').where('title', '<=', 'Korgalzhyn\uf8ff').get();

    if (snap.empty) {
        console.error('❌ Korgalzhyn attraction not found!');
        // Fuzzy
        const all = await attractionsRef.get();
        const found = all.docs.find(d => {
            const t = d.data().title.toLowerCase();
            return (t.includes('korgalzhyn') || t.includes('nature reserve'));
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
    console.log(`✅ Found Korgalzhyn: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: korgalzhynContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovateKorgalzhyn().catch(console.error);
