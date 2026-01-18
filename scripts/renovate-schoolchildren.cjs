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

const schoolContent = `
# A Spaceship for the Next Generation

At first glance, the Palace of Schoolchildren in Astana looks like a futuristic spacecraft that has landed in the middle of the city. Opened in 2011, this dedicated youth center is a bold architectural statement about the value the nation places on its future. Designed by Studio 44 Architects from St. Petersburg, the building is defined by a massive floating disc, 156 meters in diameter, which hovers above a series of colorful, geometric blocks. It is a place of boundless energy, where thousands of children come every day to explore science, art, and sport in a facility that rivals the best technical universities in the world.

# Interpreting Tradition Through Geometry

The architecture is a clever, high-tech reinterpretation of ancient nomadic symbols. The central cylindrical form refers to the "Shanyrak"—the circular wooden crown of a traditional yurt, which acts as the portal to the sky and a symbol of family unity. The colorful rectangular blocks beneath it are meant to evoke "shabadans" (felt suitcases or chests), representing the treasures of knowledge, culture, and memories that the children are unpacking as they learn.

The building is also a model of sustainable design. The roof of the complex is a walkable green platform, planted with local grasses to mimic the rolling steppe. This "green roof" not only insulates the building but brings a piece of the natural landscape into the ultra-modern urban environment, allowing students to walk on the "earth" even when they are stories high.

# A City Within a Building

The interior contains an entire world of activities, organized like a miniature city. The facility houses a state-of-the-art planetarium where students can navigate the galaxy using the latest projection technology. There is a lush winter garden that thrives year-round, analyzing biological systems even when the city outside is frozen.

Athletics are a core part of the "Palace" experience. It features a full-sized ice skating rink for hockey and figure skating, Olympic-standard swimming pools, tennis courts, and basketball halls. It functions as a comprehensive ecosystem for youth development, offering hundreds of free or low-cost clubs ("circles") ranging from traditional dombra playing and ballet to 3D modeling, robotics, and chess.

# The Creative Forge

Beyond the physical facilities, the Palace of Schoolchildren acts as a creative forge for the nation's talent. It hosts national science fairs, art exhibitions, and theatrical performances in its 500-seat amphitheater. It is here that the next generation of Kazakh engineers, artists, and leaders are finding their voice. Walking through its halls, one hears the constant buzz of activity—the sound of rehearsals, the click of computer keys, and the laughter of children—making it one of the most vibrant and optimistic places in the entire capital.
`;

async function renovateSchool() {
    const db = await initFirebase();
    console.log('🚀 Starting Palace of Schoolchildren Renovation (Expanded version)...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.error('❌ Astana region not found!');
        return;
    }

    const regionDoc = snapshot.docs[0];
    const attractionsRef = regionDoc.ref.collection('attractions');

    // Search for Schoolchildren
    let snap = await attractionsRef.where('title', '>=', 'Palace Schoolchildren').where('title', '<=', 'Palace Schoolchildren\uf8ff').get();

    if (snap.empty) {
        // Fuzzy
        const all = await attractionsRef.get();
        const found = all.docs.find(d => {
            const t = d.data().title.toLowerCase();
            return (t.includes('schoolchildren') || t.includes('palace'));
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
    console.log(`✅ Found Palace: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: schoolContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovateSchool().catch(console.error);
