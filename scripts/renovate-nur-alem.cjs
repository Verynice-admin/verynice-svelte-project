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

const nurAlemContent = `
# The Largest Sphere in the World

Nur Alem is the undeniable crown jewel of the Expo 2017 legacy. Standing 100 meters tall with a diameter of 80 meters, it holds the title of the largest spherical building in the world. It is not just an architectural marvel but a symbol of Kazakhstan's commitment to a sustainable future. The building was designed as the central pavilion for the International Specialized Exhibition, themed "Future Energy," and has since been transformed into the Museum of Future Energy.

Its perfect spherical shape is a feat of engineering, consisting of double-curved glass panes that insulate the interior while maximizing natural light. At night, the entire surface becomes a giant LED screen, projecting dynamic patterns and images that can be seen from across the city.

# A Vertical Journey Through Energy

The museum is organized vertically, with each of its eight floors dedicated to a specific type of energy. Visitors typically start at the top and spiral their way down. The 8th floor is the "Future Astana" observation deck, but the journey truly begins on the 7th floor, dedicated to **Space Energy**, showcasing the potential of solar harvesting from orbit.

As you descend, you pass through the **Solar Energy** hall (Level 6), experience the power of air currents in the **Wind Energy** hall (Level 5), and explore the potential of organic fuel in the **Biomass Energy** hall (Level 4). Level 3 focuses on **Kinetic Energy**, while Level 2 immerses you in the world of **Water Energy**. The ground floor houses the National Pavilion, celebrating Kazakhstan's culture and history.

# A Living Power Station

Nur Alem is a "living" building that generates its own power. It is one of the few structures in the world to integrate large-scale wind turbines directly into its façade. The two sleek, silent turbines at the top of the sphere work in tandem with photovoltaic panels seamlessly embedded in the outer shell to harvest energy from the sun and wind. This integration demonstrates that sustainable design can be beautiful as well as functional.

# The Glass Bridge Thrill

For those seeking an adrenaline rush, the top level features a glass-bottomed bridge. Walking across it offers a vertigo-inducing view of the atrium below, looking all the way down to the ground floor 100 meters beneath your feet. It is a favorite photo spot for visitors, offering both a thrill and a unique perspective on the massive scale of the sphere's interior.
`;

async function renovateNurAlem() {
    const db = await initFirebase();
    console.log('🚀 Starting Nur Alem Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.error('❌ Astana region not found!');
        return;
    }

    const regionDoc = snapshot.docs[0];
    const attractionsRef = regionDoc.ref.collection('attractions');

    // Search for Nur Alem
    let snap = await attractionsRef.where('title', '>=', 'Nur Alem').where('title', '<=', 'Nur Alem\uf8ff').get();

    if (snap.empty) {
        // Try Sphere
        snap = await attractionsRef.where('title', '>=', 'Sphere').where('title', '<=', 'Sphere\uf8ff').get();
    }

    if (snap.empty) {
        console.error('❌ Nur Alem attraction not found!');
        // Fuzzy
        const all = await attractionsRef.get();
        const found = all.docs.find(d => {
            const t = d.data().title.toLowerCase();
            return (t.includes('nur') && t.includes('alem')) || t.includes('expo') || t.includes('sphere');
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
    console.log(`✅ Found Nur Alem: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: nurAlemContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovateNurAlem().catch(console.error);
