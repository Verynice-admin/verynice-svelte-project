const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const variations = {
    titles: [
        "A Comprehensive Exploration of {title}",
        "Discovering the Wonders of {name}",
        "High-Altitude Majesty: A Journey to {name}",
        "The {metaphor}: An Insider's Look at {name}",
        "Unveiling the {metaphor} of {name}",
        "Treasures of the Region: {name}",
        "The {name} Experience: A Modern Guide",
        "A Deep-Dive into {name}: {metaphor}",
        "The Traveler's Perspective on {name}",
        "Timeless Heritage: {name} in Focus"
    ],
    wowFactorStart: [
        "The true 'Wow-Factor' of {name} lies in the {feature}, offering a stunning visual spectacle.",
        "To stand before {name} is to witness the sheer grandeur of the {feature}.",
        "The immediate impression of {name} is dominated by the {feature}, a sight that commands absolute attention.",
        "Few places in Kazakhstan offer the visual intensity of {name}'s {feature}.",
        "The aesthetic power of {name} is centered on the {feature}, offering a cinematic experience for all visitors."
    ],
    sensory: [
        "The air here carries the faint scent of {scent}, while the only sound is the rhythmic {sound}.",
        "Visitors are often struck by the sensory depth of the location—the aroma of {scent} and the distant {sound}.",
        "A profound silence is occasionally punctuated by the {sound}, complemented by the sharp scent of {scent}.",
        "The crisp atmosphere is filled with the fragrance of {scent}, creating a peaceful backdrop to the {sound}."
    ],
    zeros: [
        "A conscientious 'Clean-Visit' protocol is in effect, encouraging all guests to remove all waste.",
        "Eco-conscious guidelines request that visitors take full responsibility for their environmental footprint.",
        "Strict waste management systems are in place to preserve the delicate balance of the environment.",
        "The location operates on a leave-no-trace policy to protect the local flora and fauna."
    ],
    connectivity: [
        "Modern infrastructure ensures seamless connectivity, allowing travelers to stay connected throughout their journey.",
        "The site is supported by modern digital networks, providing full utility for the contemporary explorer.",
        "Digital utility is discreetly woven into the visitor experience, offering reliable connectivity throughout.",
        "You'll find stable mobile coverage across the main visitor areas, making digital navigation effortless."
    ],
    community: [
        "By engaging with local artisans, travelers directly support the economic health of the surrounding communities.",
        "Tourism proceeds play a vital role in supporting educational and infrastructure programs for the regional towns.",
        "Every visit helps sustain the traditional craftsmanship and livelihoods of the local residents.",
        "The cooperative model used here ensures that the benefits of tourism are shared equitably among the families."
    ],
    restoration: [
        "Opportunities exist for travelers to learn about the conservation efforts firsthand alongside park staff.",
        "Visitor outreach programs allow guests to understand the geological and biological preservation work being done.",
        "Guest participation in eco-awareness initiatives helps maintain the integrity of the natural trails.",
        "Collaborative efforts between the site administration and visitors ensure the long-term health of the heritage zone."
    ]
};

async function initFirebase() {
    if (admin.apps.length) return admin.firestore();
    const saVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    let sa;
    if (saVar) sa = JSON.parse(saVar);
    else if (fs.existsSync(path.resolve('.secrets/serviceAccountKey.json'))) {
        sa = JSON.parse(fs.readFileSync(path.resolve('.secrets/serviceAccountKey.json'), 'utf8'));
    }
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    return admin.firestore();
}

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function renovateContent(content, title) {
    if (!content) return content;
    let renewed = content;

    // 1. Title Renovation
    renewed = renewed.replace(/^# .*: (.*) - Definitive.*Guide/mi, (match, metaphor) => {
        return "# " + getRandom(variations.titles).replace(/{name}/g, title).replace(/{metaphor}/g, metaphor);
    });
    renewed = renewed.replace(/^# Exploring .*: A.*Comprehensive Guide/mi, `# ${getRandom(variations.titles).replace(/{name}/g, title)}`);

    // 2. Fact-Checking Hallucinations
    renewed = renewed.replace(/Starlight Balcony/g, "Elevated Observation Deck");
    renewed = renewed.replace(/Silent Electric Shuttles/gi, "Managed Tourist Shuttles");
    renewed = renewed.replace(/Digital Geopark Hub/gi, "Visitor Information Center");
    renewed = renewed.replace(/Digital History Lab/gi, "On-site Interpretive Center");
    renewed = renewed.replace(/QazDigital tourism grid/gi, "National Tourism Infrastructure");
    renewed = renewed.replace(/Pulse of the Steppe project/gi, "Regional Conservation Initiative");
    renewed = renewed.replace(/National Parks Qazaqstan app/gi, "Official E-Government Portal");
    renewed = renewed.replace(/National Park Meteo app/gi, "Regional Weather Services");
    renewed = renewed.replace(/Unquestionably requires a high-clearance SUV/gi, "A high-clearance vehicle is strongly recommended");

    // 3. Boilerplate Replacement (Aggressive)

    // Sustainability Section
    renewed = renewed.replace(/This ensures that the tourism wealth supports the health and education of the (.*?)\./gi, () => {
        return getRandom(variations.community);
    });

    renewed = renewed.replace(/participation in the .*? Week\"? allows travelers to work alongside .*? to maintain the eco-trails\./gi, () => {
        return getRandom(variations.restoration);
    });

    renewed = renewed.replace(/the .*? policy means all visitors are expected to carry out every piece of refuse\./gi, () => {
        return getRandom(variations.zeros);
    });

    // Connectivity
    renewed = renewed.replace(/5G coverage around the .*? is excellent .*? but the .*? will drain your battery as it searches for a signal .*?\./gi, () => {
        return getRandom(variations.connectivity);
    });

    // CPL Filter
    renewed = renewed.replace(/for photographers, use a \*\*cpl filter\*\* to cut the (glare|reflection) off the (.*?)\./gi, (match, type, target) => {
        return `For the best photographic results, a polarizing filter can help enhance the colors of the ${target} and reduce reflections.`;
    });

    // Sensory
    renewed = renewed.replace(/the sensory experience is characterized by the (absolute silence|rhythmic sound) of the (.*?) and the scent of (.*?)\./gi, (match, type, sound, scent) => {
        return getRandom(variations.sensory).replace(/{sound}/g, sound).replace(/{scent}/g, scent);
    });

    // Wow-Factor
    renewed = renewed.replace(/the "wow-factor" of .*? is the immediate, cinematic impact of the (.*?) at sunrise\./gi, (match, feature) => {
        return getRandom(variations.wowFactorStart).replace(/{name}/g, title).replace(/{feature}/g, feature);
    });

    // Soul of the Nation
    renewed = renewed.replace(/reminder that the soul of the nation belongs to the (.*?) as much as it does to the open steppe\./gi, () => {
        return "It stands as a testament to the diverse and resilient character of the nation's heritage.";
    });

    // 4. Branding Removal
    renewed = renewed.replace(/2026/g, "modern");
    renewed = renewed.replace(/2024-2025/g, "the last few years");
    renewed = renewed.replace(/travel status is optimal/gi, "current travel conditions are excellent");
    renewed = renewed.replace(/definitive modern guide/gi, "Professional Guide");

    // Cleanup
    renewed = renewed.replace(/modern modern/g, "modern");
    renewed = renewed.replace(/\n\n\n+/g, "\n\n");

    return renewed;
}

async function start() {
    const db = await initFirebase();
    console.log('🚀 Starting Aggressive Article Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const regionsSnap = await regionsRef.get();

    for (const regionDoc of regionsSnap.docs) {
        console.log(`\n--- Region: ${regionDoc.data().title} ---`);
        const attractionsSnap = await regionDoc.ref.collection('attractions').get();

        for (const attractionDoc of attractionsSnap.docs) {
            const data = attractionDoc.data();
            const title = data.title;
            const updates = {};

            console.log(`Processing ${title}...`);

            if (data.contentMarkdown) updates.contentMarkdown = renovateContent(data.contentMarkdown, title);
            if (data.content) updates.content = renovateContent(data.content, title);

            if (Object.keys(updates).length > 0) await attractionDoc.ref.update(updates);

            const subArticlesSnap = await attractionDoc.ref.collection('articles').get();
            for (const subDoc of subArticlesSnap.docs) {
                const subData = subDoc.data();
                const subUpdates = {};
                if (subData.contentMarkdown) subUpdates.contentMarkdown = renovateContent(subData.contentMarkdown, title);
                if (subData.content) subUpdates.content = renovateContent(subData.content, title);
                if (Object.keys(subUpdates).length > 0) await subDoc.ref.update(subUpdates);
            }
        }
    }
    console.log('\n✅ All articles aggressively renovated!');
}

start().catch(console.error);
