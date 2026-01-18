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

const polygonContent = `
# The Scar on the Steppe

For forty years, the Semipalatinsk Nuclear Test Site, simply known as "The Polygon," was the shuddering heart of the Soviet Union's nuclear ambitions. Spanning 18,500 square kilometers of the Kazakh steppe—an area roughly the size of Wales—it was the venue for 456 nuclear detonations between 1949 and 1989.

Today, it stands as a haunting monument to the Cold War. It is the only nuclear test site in the world that is open to the public year-round, attracting "dark tourism" enthusiasts who come to witness the concrete scars of history, the "Atomic Lake," and the silent ruins of the military instrumentation towers.

# 40 Years of Fire

The nightmare began on August 29, 1949, with "First Lightning," the USSR's first atomic bomb test. For the next decade, mushroom clouds were a regular sight on the horizon for the people living in nearby villages. In total, 116 atmospheric tests were conducted before the tests were moved underground in 1963.

The most surreal legacy of this era is Lake Chagan, often called the "Atomic Lake." Created by a shallow underground nuclear explosion in 1965, the blast moved 10 million cubic meters of earth, forming a perfect, deep crater that filled with water. It remains radioactive to this day, a terrifyingly beautiful mirror reflecting the sky.

# The Human Cost

The strategic decision to place the site here was based on the false premise that the region was "uninhabited." In reality, hundreds of thousands of people lived in the fallout zone. They were the unwitting subjects of a four-decade experiment. Radioactive dust from the blasts settled on grazing lands, contaminating the food chain.

The health consequences were catastrophic and intergenerational. Over 1.5 million people were affected, suffering from high rates of cancer, leukemia, and birth defects. The suffering of the local population was the catalyst for the Nevada-Semipalatinsk anti-nuclear movement, led by the poet Olzhas Suleimenov, which eventually forced the closure of the site.

# Stronger Than Death

On August 29, 1991—exactly 42 years after the first test—the Polygon was officially shut down by decree of the Kazakh government. This act of sovereignty made Kazakhstan the first nation in history to voluntarily renounce its nuclear arsenal and close its test site.

In the city of Semey (formerly Semipalatinsk), the "Stronger Than Death" monument stands in Polkovnichy Island. It depicts a mother shielding her child under the silhouette of a nuclear mushroom cloud, carved into black marble—a somber tribute to the victims and a promise that such a tragedy will never be repeated.
`;

async function renovatePolygon() {
    const db = await initFirebase();
    console.log('🚀 Starting Semipalatinsk Polygon Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    // Search ALL regions
    const regionsSnap = await regionsRef.get();

    let attractionDoc = null;
    let regionTitle = '';

    for (const regionDoc of regionsSnap.docs) {
        const attractionsRef = regionDoc.ref.collection('attractions');
        const snap = await attractionsRef.where('title', '>=', 'Semipalatinsk').where('title', '<=', 'Semipalatinsk\uf8ff').get();

        if (!snap.empty) {
            attractionDoc = snap.docs[0];
            regionTitle = regionDoc.data().title;
            break;
        }

        // Fuzzy
        if (!attractionDoc) {
            const all = await attractionsRef.get();
            const found = all.docs.find(d => {
                const t = d.data().title.toLowerCase();
                return (t.includes('semipalatinsk') || t.includes('polygon'));
            });
            if (found) {
                attractionDoc = found;
                regionTitle = regionDoc.data().title;
                break;
            }
        }
    }

    if (!attractionDoc) {
        console.error('❌ Semipalatinsk attraction not found!');
        return;
    }

    await updateAttraction(attractionDoc, regionTitle);
}

async function updateAttraction(doc, region) {
    console.log(`✅ Found Polygon in [${region}]: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: polygonContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovatePolygon().catch(console.error);
