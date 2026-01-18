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

const zerendaContent = `
# The Hidden Tectonic Jewel

Often overshadowed by its famous neighbor Burabay, Zerenda Lake is the "quiet sister" of the Kokshetau region—a sanctuary for those seeking silence rather than crowds. Located in a tectonic fault zone, the lake is almost perfectly round, bordered by gentle granite hills and ancient pine forests.

It is a place where nature feels untouched. The water is exceptionally pure and fresh, warming up to a comfortable 25°C in the summer. Unlike the busy beaches of Borovoye, Zerenda offers a sense of solitude, making it the preferred escape for writers, hikers, and those looking to disconnect from the modern world.

# The Legend of Zere and Yerden

The lake’s name is born from a tragic Kazakh legend similar to Romeo and Juliet. It is said that a poor hunter named Yerden fell in love with Zere, the daughter of a wealthy bey. Forbidden from marrying, they fled into the forest, chased by the bey’s guards. Seeing no escape, they embraced and prayed to be together forever.

The spirits of the forest took pity on them. The ground beneath the lovers sank and filled with crystal-clear water—Zere's tears—forming the lake that now bears a fusion of their names. Locals believe the lake is blessed, and that couples who visit will share an eternal bond.

# Hiking the Bear Mountain

Zerenda is a hiker's paradise, with over 14 established trails winding through the fragrant pine woods. The most popular route leads to the summit of Mount Medvezhya (Bear Mountain). From the top, you can see the entire circular expanse of the lake, glittering like a dropped coin in the green velvet of the forest.

Along the way, hikers encounter strange granite formations, including the famous "Mushrooom Stone"—a massive boulder balanced precariously on a smaller base. It is a geological mystery and a favorite spot for photos.

# A Breath of Pine Forests

The Kokshetau National Park, which encompasses Zerenda, is an "island" of forest in the middle of the steppe. The air here is saturated with phytoncides released by the pine trees, which have natural healing properties for the lungs and nervous system. Walking through these woods is not just exercise; it is a therapy session provided by nature itself.
`;

async function renovateZerenda() {
    const db = await initFirebase();
    console.log('🚀 Starting Zerenda Lake Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.error('❌ Astana region not found!');
        return;
    }

    const regionDoc = snapshot.docs[0];
    const attractionsRef = regionDoc.ref.collection('attractions');

    // Search for Zerenda
    let snap = await attractionsRef.where('title', '>=', 'Zerenda').where('title', '<=', 'Zerenda\uf8ff').get();

    if (snap.empty) {
        console.error('❌ Zerenda attraction not found!');
        // Fuzzy
        const all = await attractionsRef.get();
        const found = all.docs.find(d => {
            const t = d.data().title.toLowerCase();
            return (t.includes('zerenda'));
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
    console.log(`✅ Found Zerenda: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: zerendaContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovateZerenda().catch(console.error);
