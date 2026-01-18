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

const museumContent = `
# The Treasury of the Cosmos

The Baikonur Cosmodrome Museum is unlike any other museum in the world because it is located on the active territory of the world's first and largest spaceport. It serves as the tangible memory of humanity's greatest adventures. With over 15,000 exhibits, it offers an intimate look at the hardware and humanity behind the Space Race.

The collection includes everything from the personal belongings of the first cosmonauts to the actual landing capsules that returned them safely to Earth. Walking through its halls is a journey through the evolution of rocket science, from the first Sputnik to the International Space Station.

# Touching the Buran Shuttle

One of the museum's centerpieces is a full-scale test model of the Buran, the Soviet space shuttle. While the only Buran to fly into space was tragically destroyed in a hangar collapse in 2002, this surviving sibling (OK-M) allows visitors to step inside and experience the scale of the orbiter.

You can walk into the cargo bay, sit in the pilot's seat of the cockpit, and imagine the immense complexity of flying such a machine. It stands as a bittersweet monument to a highly advanced program that was cut short by history.

# The Cottages of Giants

Just 200 meters from the main museum building stand two modest single-story houses: Cottage No. 1 and Cottage No. 2. These are the historical residences of Yuri Gagarin and Sergei Korolev.

Cottage No. 1 is where Gagarin spent the night before his historic flight on April 12, 1961. It has been preserved exactly as it was, with the original furniture and personal items, creating a time capsule of that pivotal morning. It became a tradition for decades for cosmonauts to visit this house and sleep in these beds before their own launches.

Next door, Cottage No. 2 was the home and command post of Sergei Korolev, the brilliant "Chief Designer" whose name was a state secret until his death. Here, in these simple rooms, the plans that launched the first satellite and the first human into space were finalized.

# Relics of the Star Voyagers

The museum's indoor exhibits are equally fascinating. You can see the actual control panels used in the firing rooms of the 1960s, a collection of spacesuits showing the evolution of life-support technology, and even the "space food" tubes that sustained the early explorers.

One of the most humanizing exhibits is the collection of signed items—globes, helmets, and panels—left by international crews who have launched from Baikonur, proving that this patch of Kazakh steppe is truly the gateway to the stars for the entire world.
`;

async function renovateBaikonur() {
    const db = await initFirebase();
    console.log('🚀 Starting Baikonur Museum Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    // Baikonur might be in "Other Destinations" or its own region "Baikonur"
    const regionsSnap = await regionsRef.get(); // Get ALL regions to find it

    let museumDoc = null;
    let regionTitle = '';

    for (const regionDoc of regionsSnap.docs) {
        const attractionsRef = regionDoc.ref.collection('attractions');
        const snap = await attractionsRef.where('title', '>=', 'Baikonur Cosmodrome Museum').where('title', '<=', 'Baikonur Cosmodrome Museum\uf8ff').get();

        if (!snap.empty) {
            museumDoc = snap.docs[0];
            regionTitle = regionDoc.data().title;
            break;
        }

        // Fuzzy search
        if (!museumDoc) {
            const all = await attractionsRef.get();
            const found = all.docs.find(d => {
                const t = d.data().title.toLowerCase();
                return (t.includes('baikonur') && t.includes('museum'));
            });
            if (found) {
                museumDoc = found;
                regionTitle = regionDoc.data().title;
                break;
            }
        }
    }

    if (!museumDoc) {
        console.error('❌ Baikonur Museum attraction not found in any region!');
        return;
    }

    await updateAttraction(museumDoc, regionTitle);
}

async function updateAttraction(doc, region) {
    console.log(`✅ Found Museum in [${region}]: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: museumContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovateBaikonur().catch(console.error);
