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

const nurAstanaContent = `
# A Gift from the Golden Sands

Before the construction of the colossal Hazrat Sultan and the new Grand Mosque, the Nur-Astana Mosque was the spiritual jewel of the capital's Left Bank. Its shimmering gold domes, which reflect the sun during the day and glow warmly at night, are instantly recognizable against the city's modern skyline.

The mosque is a tangible symbol of friendship between nations, built in 2005 as a gift from the Emir of Qatar, Sheikh Hamad bin Khalifa al-Thani, to the people of Kazakhstan. It stands as a bridge between the Arabic roots of Islam and its unique expression in the Central Asian steppe.

# Architecture of Numbers

Designed by Lebanese architect Charles Hadife, the building is not just a place of worship but a coded architectural message. The main dome, plated in real gold, soars to a height of 40 meters—symbolizing the age at which the Prophet Muhammad received his first revelation.

Surrounding the dome are four soaring minarets, each reaching exactly 63 meters into the sky. This height represents the earthly age of the Prophet Muhammad when he passed away. These precise dimensions weave the biography of the Prophet directly into the physical structure of the sanctuary.

# White Granite and Blue Scripture

The exterior of the mosque is clad in dazzling white granite, chosen to withstand the harsh Astana winters while symbolizing purity. The stark whiteness is beautifully contrasted by deep blue inscriptions of Quranic verses that wrap around the building, creating a visual rhythm of faith and art.

Inside, the prayer hall is expansive and airy, capable of holding 5,000 worshippers. The interior design blends traditional Islamic geometric patterns with modern materials like glass and concrete, creating a space that feels both ancient and forward-looking. Specifically designed for the harsh climate, the mosque is a warm, welcoming refuge when the winter winds howl outside, and a cool, serene sanctuary during the blazing summer heat.
`;

async function renovateNurAstana() {
    const db = await initFirebase();
    console.log('🚀 Starting Nur-Astana Mosque Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    // Search ALL regions
    const regionsSnap = await regionsRef.get();

    let attractionDoc = null;
    let regionTitle = '';

    for (const regionDoc of regionsSnap.docs) {
        const attractionsRef = regionDoc.ref.collection('attractions');
        const snap = await attractionsRef.where('title', '>=', 'Nur Astana').where('title', '<=', 'Nur Astana\uf8ff').get();

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
                return (t.includes('nur') && t.includes('astana') && t.includes('mosque'));
            });
            if (found) {
                attractionDoc = found;
                regionTitle = regionDoc.data().title;
                break;
            }
        }
    }

    if (!attractionDoc) {
        console.error('❌ Nur Astana Mosque attraction not found!');
        return;
    }

    await updateAttraction(attractionDoc, regionTitle);
}

async function updateAttraction(doc, region) {
    console.log(`✅ Found Mosque in [${region}]: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: nurAstanaContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovateNurAstana().catch(console.error);
