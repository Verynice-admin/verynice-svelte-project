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

const astanaContent = `
# The Miracle in the Steppe

Astana is often called the "Dubai of the North" or the "Singapore of the Steppe," but these comparisons fail to capture its unique spirit. In 1997, the capital of Kazakhstan was moved from the lush, mountain-ringed city of Almaty to a wind-swept provincial town in the northern heartland. Critics called it madness. Yet, in less than three decades, a futuristic metropolis has risen from the grassy plains, defying both geography and expectations.

Today, Astana is a city of bold experimentation, where the world's leading architects—from Norman Foster to Kisho Kurokawa—have been given a blank canvas to dream. The result is a skyline that looks like a science fiction movie set, featuring giant transparent tents, golden towers, and pyramid-shaped palaces.

# A City of Extremes

Astana holds the title of the second-coldest national capital in the world, surpassed only by Ulaanbaatar. The climate here is not for the faint of heart; winters can see temperatures plunge below -40°C, while summers blaze at +40°C. This harsh environment has bred a culture of resilience and innovation. The city is designed to conquer the elements, with enclosed walkways, heated bus stops, and massive indoor atriums like the Khan Shatyr that offer an "eternal summer" regardless of the blizzard outside.

# The "Metabolism" of a Capital

The master plan of the city was designed by the Japanese visionary Kisho Kurokawa based on the philosophy of "Metabolism"—the idea that a city should grow and evolve like a living organism. Nowhere is this more visible than on the Left Bank, the new administrative center. Here, the layout is monumental, designed to impress and to protect. The Ishim River, once a quiet stream, has been widened and tamed to become the city's blue artery, separating the historic, soulful Right Bank from the glittering, ambitious Left Bank.

# The Pulse of Eurasia

Geographically, Astana sits at the heart of the Eurasian continent. It is a bridge between East and West, a role formalized by its designation as a UNESCO "City of Peace." It is a place where nomadic traditions meet the space age, where the "Golden Man" warrior stands guard over a skyline of glass and steel. To visit Astana is to witness a nation actively inventing its own future.
`;

async function renovateAstanaCity() {
    const db = await initFirebase();
    console.log('🚀 Starting Astana City Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.error('❌ Astana region not found!');
        return;
    }

    const regionDoc = snapshot.docs[0];
    const attractionsRef = regionDoc.ref.collection('attractions');

    // Search for Astana City
    // Usually "Astana City" or just "Astana"
    let snap = await attractionsRef.where('title', '>=', 'Astana City').where('title', '<=', 'Astana City\uf8ff').get();

    if (snap.empty) {
        // Fuzzy
        const all = await attractionsRef.get();
        const found = all.docs.find(d => {
            const t = d.data().title.toLowerCase();
            return (t === 'astana city' || t === 'astana' || t.includes('introduction'));
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
    console.log(`✅ Found Astana City: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: astanaContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovateAstanaCity().catch(console.error);
