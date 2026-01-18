const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Pre-defined variations for boilerplate sections to ensure uniqueness
const variations = {
    titles: [
        "A Comprehensive Exploration of {title}",
        "Discovering the Wonders of {name}",
        "High-Altitude Majesty: A Journey to {name}",
        "The {metaphor}: An Insider's Look at {name}",
        "Unveiling the {metaphor} of {name}",
        "Treasures of the Steppe: {name}",
        "Eternal Beauty: The {name} Experience",
        "A Deep-Dive into {name}: The {metaphor}",
        "The Modern Traveler's Guide to {name}",
        "Timeless Heritage: {name}"
    ],
    wowFactorStart: [
        "The true 'Wow-Factor' of {name} lies in its {feature}, which creates a stunning visual spectacle.",
        "To stand before {name} is to witness the sheer grandeur of {feature}.",
        "The immediate impression of {name} is dominated by {feature}, a sight that commands absolute attention.",
        "Few places on earth offer the visual intensity of {name}'s {feature}.",
        "The aesthetic power of {name} is centered on the {feature}, offering a cinematic experience for all visitors."
    ],
    sensory: [
        "The air here carries the faint scent of {scent}, while the only sound is the rhythmic {sound}.",
        "Visitors are often struck by the sensory depth of the location—the aroma of {scent} and the distant {sound}.",
        "A profound silence is occasionally punctuated by the {sound}, complemented by the sharp scent of {scent}.",
        "The crisp atmosphere is filled with the fragrance of {scent}, creating a peaceful backdrop to the {sound}."
    ],
    soulOfNation: [
        "For the people of Kazakhstan, this site represents the resilient spirit of the southern region.",
        "The legacy of {name} is deeply woven into the cultural fabric of the nation.",
        "This location stands as a testament to the enduring bond between the land and its history.",
        "It serves as a cultural lighthouse, illuminating the connection between ancient traditions and modern identity."
    ],
    connectivity: [
        "Modern telecommunications ensure seamless connectivity, allowing travelers to share their experience instantly.",
        "The site is fully integrated with high-speed digital networks, providing full support for the modern explorer.",
        "Digital infrastructure is discreetly woven into the visitor experience, offering reliable connectivity throughout.",
        "You'll find excellent mobile coverage across the main visitor loops, making digital navigation effortless."
    ],
    sustainability: [
        "The management of {name} prioritizes ecological integrity through a strict leave-no-trace policy.",
        "Preserving the pristine environment for future generations is at the core of the local conservation strategy.",
        "Environmental stewardship is managed through integrated projects that focus on low-impact tourism.",
        "The 'Green Steppe' initiative ensures that every visit contributes to the regeneration of the local ecosystem."
    ],
    zeros: [
        "A conscientious 'Clean-Visit' protocol is in effect, encouraging all guests to remove all waste.",
        "Eco-conscious guidelines request that visitors take full responsibility for their environmental footprint.",
        "Strict waste management systems are in place to preserve the delicate balance of the nature reserve.",
        "The park operates on a total-removal waste policy to protect the local flora and fauna."
    ],
    community: [
        "By engaging with local artisans, travelers directly support the economic health of the surrounding villages.",
        "Tourism proceeds are channeled into educational and healthcare programs for the regional communities.",
        "Every visit helps sustain the traditional craftsmanship and livelihoods of the nearby residents.",
        "The local cooperative model ensures that the benefits of tourism are shared equitably among the families here."
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

function renovateContent(content, title, region) {
    if (!content) return content;
    let renewed = content;

    // Remove "Definitive 2026 Guide" and similar markers
    renewed = renewed.replace(/# .*: .* - Definitive 2026 Guide/i, () => {
        const metMatch = content.match(/# .*: (.*) - Definitive/);
        const metaphor = metMatch ? metMatch[1] : "The Pristine Frontier";
        return "# " + getRandom(variations.titles).replace(/{title}/g, title).replace(/{name}/g, title).replace(/{metaphor}/g, metaphor);
    });

    // Generic Title fallback
    renewed = renewed.replace(/# Exploring .*: A 2026 Comprehensive Guide/i, `# ${getRandom(variations.titles).replace(/{title}/g, title).replace(/{name}/g, title)}`);

    // Replace the "Wow-Factor" common phrasing
    renewed = renewed.replace(/The "Wow-Factor" of .* is the immediate, cinematic impact of the (.*?) at sunrise\./gi, (match, feature) => {
        return getRandom(variations.wowFactorStart).replace(/{name}/g, title).replace(/{feature}/g, feature);
    });

    // Replace sensory descriptions
    renewed = renewed.replace(/The sensory experience is characterized by the (.*?) of (.*?) and the scent of (.*?)\./gi, (match, type, sound, scent) => {
        return getRandom(variations.sensory).replace(/{sound}/g, sound).replace(/{scent}/g, scent);
    });

    // Cultural / Soul replacement
    renewed = renewed.replace(/reminder that the soul of the nation belongs to the (.*?) as much as it does to the open steppe\./gi, (match, place) => {
        return getRandom(variations.soulOfNation).replace(/{name}/g, title);
    });

    // 5G / Connectivity
    renewed = renewed.replace(/5G coverage around the (.*?) is excellent in 2026, but the (.*?) will drain your battery as it searches for a signal among the (.*?)\./gi, (match, complex, area, feature) => {
        return getRandom(variations.connectivity) + ` Note: The more remote areas near the ${feature} may have fluctuating signals.`;
    });

    // Sustainability/Community
    renewed = renewed.replace(/This ensures that the tourism wealth supports the health and education of the (.*?)\./gi, (match, people) => {
        return getRandom(variations.community).replace(/{name}/g, title);
    });

    renewed = renewed.replace(/The (2026 )?"Zero-Trash" policy means all visitors are expected to carry out every piece of refuse\./gi, () => {
        return getRandom(variations.zeros);
    });

    // Remove specific 2026 references generally
    renewed = renewed.replace(/2026/g, "modern");
    renewed = renewed.replace(/Logistics modern/g, "Travel Logistics");
    renewed = renewed.replace(/Practical Logistics modern/g, "Practical Logistics");
    renewed = renewed.replace(/travel status is optimal/g, "current travel conditions are ideal");
    renewed = renewed.replace(/travel status/g, "current access status");

    // Clean up double "modern" or "recently"
    renewed = renewed.replace(/modern modern/g, "modern");

    return renewed;
}

async function start() {
    const db = await initFirebase();
    console.log('🚀 Starting Article Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const regionsSnap = await regionsRef.get();

    for (const regionDoc of regionsSnap.docs) {
        const regionTitle = regionDoc.data().title;
        console.log(`\n--- Region: ${regionTitle} ---`);

        const attractionsRef = regionDoc.ref.collection('attractions');
        const attractionsSnap = await attractionsRef.get();

        for (const attractionDoc of attractionsSnap.docs) {
            const data = attractionDoc.data();
            const title = data.title;
            const updates = {};

            console.log(`Processing ${title}...`);

            if (data.contentMarkdown) {
                updates.contentMarkdown = renovateContent(data.contentMarkdown, title, regionTitle);
            }
            if (data.content) {
                updates.content = renovateContent(data.content, title, regionTitle);
            }

            if (Object.keys(updates).length > 0) {
                await attractionDoc.ref.update(updates);
            }

            // Update subcollection articles
            const subArticlesSnap = await attractionDoc.ref.collection('articles').get();
            for (const subDoc of subArticlesSnap.docs) {
                const subData = subDoc.data();
                const subUpdates = {};
                if (subData.contentMarkdown) {
                    subUpdates.contentMarkdown = renovateContent(subData.contentMarkdown, title, regionTitle);
                }
                if (subData.content) {
                    subUpdates.content = renovateContent(subData.content, title, regionTitle);
                }
                if (Object.keys(subUpdates).length > 0) {
                    await subDoc.ref.update(subUpdates);
                }
            }
        }
    }

    console.log('\n✅ All articles renovated and unik-ified!');
}

start().catch(console.error);
