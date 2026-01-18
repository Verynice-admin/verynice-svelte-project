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

const burabayContent = `
# The "Switzerland" of Central Asia

Nestled in the north of the country, Burabay National Park (often called Borovoye) is a stunning anomaly in the vast Kazakh steppe. Often referred to as "The Pearl of Kazakhstan" or "Kazakhstan's Switzerland," this UNESCO Biosphere Reserve covers nearly 130,000 hectares of pristine landscape. It is a surreal world where dense pine forests, crystal-clear lakes, and bizarre rock formations rise abruptly from the flat plains, creating a microclimate of exceptionally pure, pine-scented air.

For centuries, this land was a sacred sanctuary for nomadic tribes, a place of healing and refuge. Today, it stands as the nation's premier nature resort, offering a stark and beautiful contrast to the futuristic architecture of the nearby capital, Astana.

# Okzhetpes: The Rock "Where Arrows Cannot Reach"

Dominating the skyline of Lake Borovoye is the majestic rock known as Okzhetpes. Its name translates literally to "the arrow will not reach," a testament to its imposing height of 300 meters. The rock's shape is unique, resembling a lying elephant from one angle and a mythical creature from another.

Legend tells of a proud captive maiden who refused to marry a khan's warrior. She climbed to the very top of this peak and declared she would only wed the man whose arrow could reach her flowing handkerchief. Every warrior failed, their arrows falling short of the towering summit. To keep her freedom, she leapt from the cliff into the waters below, transforming into a symbol of unyielding spirit.

# Zhumbaktas: The Enigmatic Sphinx

Rising directly from the center of the Blue Bay is the park's most mysterious landmark: Zhumbaktas, or the "Mystery Stone." This rock formation is a natural optical illusion. As you approach it by boat, its profile shifts dramatically: from one angle, it looks like a young girl with wind-blown hair; from another, an old crone; and from a third, a stoic Sphinx.

The local legend recounts a tragic love story of a rich bai's daughter and a poor akyn (musician) who fled here to escape her father's wrath. Trapped by their pursuers, they prayed to be turned into stone rather than be separated. The creator granted their wish—the boy became Okzhetpes, forever guarding the lake, and the girl became Zhumbaktas, eternally floating in the waters he watches over.

# The Dancing Birches and Healing Air

Beyond the rocks, the park is famous for its "Dancing Birches," a grove of birch trees with trunks twisted into uniquely contorted shapes, looking as if they were frozen in the middle of a pagan dance. While scientists attribute this to the shifting soil and winds, folklore suggests they were once beautiful girls turned to wood during a festival.

The air in Burabay is renowned for its therapeutic properties, rich in pine pollen and ozone. It has been a health destination since the 19th century, drawing visitors who seek to cleanse their lungs and spirits in the silence of the ancient forest.
`;

async function renovateBurabay() {
    const db = await initFirebase();
    console.log('🚀 Starting Burabay National Park Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.error('❌ Astana region not found!');
        return;
    }

    const regionDoc = snapshot.docs[0];
    const attractionsRef = regionDoc.ref.collection('attractions');

    // Search for Burabay
    let snap = await attractionsRef.where('title', '>=', 'Burabay').where('title', '<=', 'Burabay\uf8ff').get();

    if (snap.empty) {
        // Try Borovoe
        snap = await attractionsRef.where('title', '>=', 'Borovoe').where('title', '<=', 'Borovoe\uf8ff').get();
    }

    if (snap.empty) {
        console.error('❌ Burabay attraction not found!');
        // Fuzzy
        const all = await attractionsRef.get();
        const found = all.docs.find(d => {
            const t = d.data().title.toLowerCase();
            return t.includes('burabay') || t.includes('borovoe') || t.includes('national park');
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
    console.log(`✅ Found Burabay: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: burabayContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovateBurabay().catch(console.error);
