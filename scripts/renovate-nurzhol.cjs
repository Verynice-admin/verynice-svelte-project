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

const nurzholContent = `
# The Spine of the New Capital

Nurzhol Boulevard is the architectural backbone of Astana, a meticulously planned axis that visually and physically connects the city’s most important landmarks. Stretching from the white splendor of the Ak Orda Presidential Palace in the east to the translucent tent of Khan Shatyr in the west, this pedestrian thoroughfare is where the scale of the capital truly reveals itself.

Formerly known as "Green Water Boulevard," it is a masterpiece of urban design that draws residents and tourists alike. Standing in the center of the boulevard, near the Baiterek Tower, offers a 360-degree panorama of the "future city" rising from the steppe.

# The Vision of Kisho Kurokawa

The layout of the boulevard is the direct result of the master plan conceived by the renowned Japanese architect Kisho Kurokawa. A founder of the Metabolism movement, Kurokawa envisioned Astana not as a static grid but as a living organism capable of growth and change. His philosophy of "Symbiosis" is embedded in every meter of Nurzhol Boulevard, which seeks to harmonize high-tech architecture with nature and human activity.

Kurokawa designed the city on a linear axis to allow for efficient expansion, a concept that defied the traditional radial planning of Soviet cities. Nurzhol is the realization of this philosophy—a "river" of movement and life flowing through the steel canyons of the business district.

# A Three-Tiered Urban Wonder

What most visitors walk upon is actually the roof of a complex, multi-layered structure. Nurzhol Boulevard is ingeniously designed on three levels:
1.  **The Upper Level:** A pedestrian-only promenade lined with fountains, flower beds, and art installations. This is the public face of the city, safe from traffic and noise.
2.  **The Middle Level:** A bustling zone of shops, restaurants, exhibition halls, and offices. It provides the commercial pulse that keeps the boulevard alive year-round.
3.  **The Lower Level:** Dedicated to transport infrastructure and parking, keeping cars hidden from view and allowing the surface to remain a pristine parkland.

# The Art of the Walk

Walking the length of Nurzhol is an artistic journey. The promenade is adorned with twelve bronze sculptures depicting traditional nomadic figures, including a Shaman, a Guard, and a Dancer. These statues ground the futuristic surroundings in the deep cultural history of the Kazakh people.

In the summer, the boulevard comes alive with the sound of splashing water from its many fountains. In the winter, it transforms into an exhibition of ice sculptures and lights. It is the stage upon which the daily life of the capital creates its own theater.
`;

async function renovateNurzhol() {
    const db = await initFirebase();
    console.log('🚀 Starting Nurzhol Boulevard Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.error('❌ Astana region not found!');
        return;
    }

    const regionDoc = snapshot.docs[0];
    const attractionsRef = regionDoc.ref.collection('attractions');

    // Search for Nurzhol
    let snap = await attractionsRef.where('title', '>=', 'Nurzhol').where('title', '<=', 'Nurzhol\uf8ff').get();

    if (snap.empty) {
        console.error('❌ Nurzhol attraction not found!');
        // Fuzzy
        const all = await attractionsRef.get();
        const found = all.docs.find(d => {
            const t = d.data().title.toLowerCase();
            return (t.includes('nurzhol') || t.includes('boulevard') || t.includes('green water'));
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
    console.log(`✅ Found Nurzhol: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: nurzholContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovateNurzhol().catch(console.error);
