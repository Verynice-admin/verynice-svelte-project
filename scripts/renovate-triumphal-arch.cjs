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

const archContent = `
# The Gateway to the Eternal Nation

The Triumphal Arch "Mangilik El" is more than just a city gate; it is a monument to the philosophy of the modern Kazakh state. The name translates to "Eternal Nation," reflecting the country's aspiration for enduring sovereignty and unity. Inaugurated on the 20th anniversary of Kazakhstan's independence, every dimension of the structure is symbolic. Its height is exactly 20 meters, marking the anniversary year, while the observation deck sits slightly higher, offering a view over the triumphal avenue that bears the same name.

Constructed from pure white granite and marble, the arch stands as a pristine symbol of optimism and clarity. It is located at the intersection of the city's major thoroughfares, acting as a ceremonial entrance to the new administrative center.

# Guardians of the State

The arch is adorned with profound sculptural narratives. Four bronze figures sit in the niches, each representing a pillar of the national mentality. The "Aksakal" (Sage) symbolizes wisdom and memory; the "Mother" represents the hearth and nurturing spirit; the "Batyr" (Medieval Warrior) embodies the heroic past; and the "Modern Soldier" represents the defense of the future.

Above them, the symbol of the "Shanyrak" (the crown of the yurt) and the Golden Eagle speak to the unity of the people and their high aspirations. The sides of the arch feature complex relief panels depicting the history of the Kazakhs from the time of the Saka warriors to the present day.

# Inside the Monument

Unusually for a triumphal arch, the interior is a functional cultural space. Visitors can access the structure via a pedestrian underpass, which acts as a gallery showcasing photography and art about the capital’s history. Inside the arch itself, a multimedia exhibition hall guides guests through the complex iconography of the monument.

# A Panoramic Perspective

A climb to the top reveals an observation deck with panoramic binoculars. From this vantage point, visitors can look down the arrow-straight Mangilik El Avenue, flanked by the futuristic architecture of the Expo 2017 site on one side and the growing skyline of the new residential districts on the other. It is a place to stand and reflect on the rapid transformation of the steppe into a global metropolis.
`;

async function renovateArch() {
    const db = await initFirebase();
    console.log('🚀 Starting Triumphal Arch Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.error('❌ Astana region not found!');
        return;
    }

    const regionDoc = snapshot.docs[0];
    const attractionsRef = regionDoc.ref.collection('attractions');

    // Search for Arch
    let snap = await attractionsRef.where('title', '>=', 'Triumphal Arch').where('title', '<=', 'Triumphal Arch\uf8ff').get();

    if (snap.empty) {
        console.error('❌ Triumphal Arch attraction not found!');
        // Fuzzy
        const all = await attractionsRef.get();
        const found = all.docs.find(d => {
            const t = d.data().title.toLowerCase();
            return (t.includes('arch') && t.includes('mangilik'));
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
    console.log(`✅ Found Arch: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: archContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovateArch().catch(console.error);
