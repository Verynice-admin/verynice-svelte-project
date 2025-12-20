const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize
const secretsPath = path.resolve(__dirname, '..', '.secrets', 'serviceAccountKey.json');
if (!fs.existsSync(secretsPath)) {
    console.error('Service account not found in .secrets');
    process.exit(1);
}
const serviceAccount = require(secretsPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

// RETIERING LOGIC
// Matches partial titles to update Tiers.
const TIER_1_KEYWORDS = [
    'Shymbulak', 'Medeu', 'Big Almaty Lake', 'Charyn', 'Kolsai', 'Kaindy', 'Zenkov', 'Kok Tobe', // Almaty
    'Bayterek', 'Khan Shatyr', 'Grand Mosque', 'National Museum', // Astana
    'Khoja Ahmed Yasawi', // Turkistan
    'Bozzhira', 'Sherkala', 'Ustyurt', // West
    'Burabay', // North
    'Singing Dune', 'Altyn-Emel', // Altyn Emel
    'Tamgaly Petroglyphs' // UNESCO
];

const TIER_2_KEYWORDS = [
    'Green Bazaar', 'Panfilov', 'Central State Museum', 'Ile-Alatau', 'Issyk Lake', 'Turgen', // Almaty
    'Peace and Reconciliation', 'Hazrat Sultan', 'Nur Alem', 'Expo', // Astana
    'Otrar', 'Sauran', 'Akmeshit', // South
    'Shakpak Ata', 'Torysh', 'Valley of Balls', 'Zhygylgan', 'Akkergeshen', // West
    'Kiin-Kerish', 'Rakhmanov', // East
    'Zharkent', // Semirechye
    'Arystan Bab' // South
];

async function retier() {
    const collectionRef = db.collection('pages').doc('attractionsPage').collection('attractions');
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
        console.log('No attractions to retier.');
        return;
    }

    const batch = db.batch();
    let count = 0;

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        const title = data.title || '';
        let newTier = 3; // Default

        // Check Tier 1
        if (TIER_1_KEYWORDS.some(k => title.toLowerCase().includes(k.toLowerCase()))) {
            newTier = 1;
        }
        // Check Tier 2
        else if (TIER_2_KEYWORDS.some(k => title.toLowerCase().includes(k.toLowerCase()))) {
            newTier = 2;
        }

        // Only update if changed (or if field is missing which implies we should set it)
        if (data.tier != newTier) { // loose equality for string '1' vs number 1
            batch.update(doc.ref, { tier: newTier });
            console.log(`Updating [${title}] from Tier ${data.tier} -> Tier ${newTier}`);
            count++;
        }
    });

    if (count > 0) {
        await batch.commit();
        console.log(`Successfully retiered ${count} attractions.`);
    } else {
        console.log('All attractions already have correct tiers.');
    }
}

retier().catch(console.error).then(() => process.exit());
