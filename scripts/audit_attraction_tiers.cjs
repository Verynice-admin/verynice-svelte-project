const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
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

async function auditTiers() {
    const snapshot = await db.collection('pages').doc('attractionsPage').collection('attractions').get();

    if (snapshot.empty) {
        console.log('No attractions found.');
        return;
    }

    const items = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        items.push({
            id: doc.id,
            title: data.title,
            region: data.region,
            tier: data.tier,
            // order: data.order // might be relevant
        });
    });

    // Sort by Region then Tier then Title for readability
    items.sort((a, b) => {
        if (a.region !== b.region) return (a.region || '').localeCompare(b.region || '');
        if (a.tier !== b.tier) return Number(a.tier) - Number(b.tier);
        return (a.title || '').localeCompare(b.title || '');
    });

    console.log('--- Current Attraction Tiers ---');
    items.forEach(item => {
        console.log(`[Tier ${item.tier}] ${item.title} (${item.region})`);
    });
}

auditTiers().catch(console.error).then(() => process.exit());
