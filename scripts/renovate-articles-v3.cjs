const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const variations = {
    titles: [
        "A Comprehensive Exploration of {name}",
        "Discovering the Wonders of {name}",
        "High-Altitude Majesty: A Journey to {name}",
        "The {metaphor}: An Insider's Look at {name}",
        "Unveiling the {metaphor} of {name}",
        "Treasures of the {region}: {name}",
        "The {name} Experience: A Modern Guide",
        "A Deep-Dive into {name}: {metaphor}",
        "The Traveler's Perspective on {name}",
        "Timeless Heritage: {name} in Focus"
    ],
    wowFactorStart: [
        "The true 'Wow-Factor' of {name} is the cinematic impact of the {feature}, particularly at dawn.",
        "To stand before the {feature} of {name} is to witness a visual spectacle of immense beauty.",
        "The immediate impression of {name} is dominated by the {feature}, a sight that defines the {region} identity.",
        "Few places in the region offer the visual intensity found at {name}'s {feature}.",
        "The aesthetic power of {name} is centered on the {feature}, creating a lasting memory for every visitor."
    ],
    sensory: [
        "The atmosphere at {name} carries the faint scent of {scent}, while the only sound is the rhythmic {sound}.",
        "Visitors to {name} are often struck by the sensory depth—the aroma of {scent} and the distant {sound}.",
        "A profound silence at {name} is occasionally punctuated by the {sound}, complemented by the sharp scent of {scent}.",
        "The crisp air around {name} is filled with the fragrance of {scent}, creating a peaceful backdrop to the {sound}."
    ],
    zeros: [
        "A conscientious 'Clean-Visit' protocol is in effect at {name}, encouraging all guests to remove all waste.",
        "Eco-conscious guidelines at {name} request that visitors take full responsibility for their environmental footprint.",
        "Strict waste management systems are in place at {name} to preserve the delicate balance of the environment.",
        "The {name} site operates on a strict leave-no-trace policy to protect the local flora and fauna."
    ],
    connectivity: [
        "Modern infrastructure around {name} ensures seamless connectivity for your digital devices.",
        "The {name} site is supported by modern digital networks, providing full utility for the contemporary explorer.",
        "At {name}, digital utility is discreetly woven into the experience, offering reliable connectivity throughout.",
        "You'll find stable mobile coverage across the main {name} visitor areas, making digital navigation effortless."
    ],
    community: [
        "By engaging with local {name} artisans, travelers directly support the economic health of the surrounding villages.",
        "Tourism proceeds from {name} play a vital role in supporting educational and infrastructure programs for the local residents.",
        "Every visit to {name} helps sustain the traditional craftsmanship and livelihoods of the regional families.",
        "The cooperative model used at {name} ensures that the benefits of tourism are shared equitably among the community."
    ],
    restoration: [
        "Opportunities exist at {name} for travelers to learn about the conservation efforts firsthand alongside the local team.",
        "Visitor outreach programs at {name} allow guests to understand the geological and biological preservation work being done.",
        "Guest participation in eco-awareness initiatives at {name} helps maintain the integrity of the natural trails.",
        "Collaborative efforts between the {name} administration and visitors ensure the long-term health of the site."
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

function getRandom(arr, name, region, metaphor, feature, scent, sound) {
    let choice = arr[Math.floor(Math.random() * arr.length)];
    return choice
        .replace(/{name}/g, name)
        .replace(/{region}/g, region)
        .replace(/{metaphor}/g, metaphor || "Natural Wonder")
        .replace(/{feature}/g, feature || "scenic landscape")
        .replace(/{scent}/g, scent || "wild herbs")
        .replace(/{sound}/g, sound || "mountain breeze");
}

function renovateContent(content, title, region) {
    if (!content) return content;
    let renewed = content;

    // 1. Meta-analysis of existing content to extract some specific context if possible
    let metaphor = "";
    const metMatch = content.match(/# .*: (.*) -/);
    if (metMatch) metaphor = metMatch[1];

    // 2. Title Renovation
    renewed = renewed.replace(/^# .*: (.*) - Definitive.*Guide/mi, () => {
        return "# " + getRandom(variations.titles, title, region, metaphor);
    });
    renewed = renewed.replace(/^# Exploring .*: A.*Comprehensive Guide/mi, () => {
        return "# " + getRandom(variations.titles, title, region, metaphor);
    });

    // 3. Section Body Renovation

    // Wow-Factor
    renewed = renewed.replace(/the "wow-factor" of .*? is the immediate, cinematic impact of the (.*?) at sunrise\./gi, (match, feature) => {
        return getRandom(variations.wowFactorStart, title, region, metaphor, feature);
    });

    // Sensory
    renewed = renewed.replace(/the sensory experience is characterized by the (absolute silence|rhythmic sound) of the (.*?) and the scent of (.*?)\./gi, (match, type, sound, scent) => {
        return getRandom(variations.sensory, title, region, metaphor, null, scent, sound);
    });

    // Sustainability Section (Aggressive multi-line catch)
    renewed = renewed.replace(/this ensures that the tourism wealth supports the health and education of the (.*?)\./gi, () => {
        return getRandom(variations.community, title, region);
    });

    renewed = renewed.replace(/participation in the .*? Week\"? allows travelers to work alongside .*? to maintain the (eco-)?trails\./gi, () => {
        return getRandom(variations.restoration, title, region);
    });

    renewed = renewed.replace(/(the (modern )?\"Zero-Trash\" policy|policy) means all visitors are expected to carry out every piece of refuse( from the sacred grounds| from the archaeological zone| from the ancient citadel| from the mountain core itself)?\./gi, () => {
        return getRandom(variations.zeros, title, region);
    });

    // Connectivity & Power Bank (Loose catch)
    renewed = renewed.replace(/(finally, )?bring a small power bank.*? searches for a signal .*?\./gi, () => {
        return getRandom(variations.connectivity, title, region);
    });
    renewed = renewed.replace(/5G coverage around the .*? is excellent .*?\./gi, () => {
        return getRandom(variations.connectivity, title, region);
    });

    // CPL Filter
    renewed = renewed.replace(/for photographers, use a \*\*cpl filter\*\* to cut the (glare|reflection) off the (.*?)\./gi, (match, type, target) => {
        return `For the best photographic results at ${title}, a polarizing filter can help enhance the colors of the ${target} and reduce surface glares.`;
    });

    // Soul of the Nation
    renewed = renewed.replace(/reminder that the soul of the nation belongs to the (.*?) as much as it does to the open steppe\./gi, () => {
        return `It serves as an enduring reminder of how ${title} contributes to the multifaceted identity of Kazakhstan.`;
    });

    // 4. Fact-Checking & Cleanups
    renewed = renewed.replace(/Starlight Balcony/g, "Elevated Observation Deck");
    renewed = renewed.replace(/Silent Electric Shuttles/gi, "Managed Tourist Shuttles");
    renewed = renewed.replace(/Digital Geopark Hub/gi, "Visitor Information Center");
    renewed = renewed.replace(/Digital History Lab/gi, "Interpretive Center");
    renewed = renewed.replace(/QazDigital tourism grid/gi, "Tourism Infrastructure");
    renewed = renewed.replace(/Pulse of the Steppe project/gi, "Conservation Initiative");
    renewed = renewed.replace(/National Parks Qazaqstan app/gi, "Official Digital Services");
    renewed = renewed.replace(/National Park Meteo app/gi, "Mountain Weather Services");

    renewed = renewed.replace(/2026/g, "modern");
    renewed = renewed.replace(/2024-2025/g, "recent years");
    renewed = renewed.replace(/modern status/gi, "current status");
    renewed = renewed.replace(/definitive modern guide/gi, "Travel Guide");

    // Cleanup repeated words
    renewed = renewed.replace(/modern modern/g, "modern");
    renewed = renewed.replace(/recent recent/g, "recent");
    renewed = renewed.replace(/\n\n\n+/g, "\n\n");

    return renewed;
}

async function start() {
    const db = await initFirebase();
    console.log('🚀 Starting Truly Unique Article Renovation (v3)...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const regionsSnap = await regionsRef.get();

    for (const regionDoc of regionsSnap.docs) {
        const regionTitle = regionDoc.data().title;
        console.log(`\n--- Region: ${regionTitle} ---`);
        const attractionsSnap = await regionDoc.ref.collection('attractions').get();

        for (const attractionDoc of attractionsSnap.docs) {
            const data = attractionDoc.data();
            const title = data.title;
            const updates = {};

            console.log(`Processing ${title}...`);

            if (data.contentMarkdown) updates.contentMarkdown = renovateContent(data.contentMarkdown, title, regionTitle);
            if (data.content) updates.content = renovateContent(data.content, title, regionTitle);

            if (Object.keys(updates).length > 0) await attractionDoc.ref.update(updates);

            const subArticlesSnap = await attractionDoc.ref.collection('articles').get();
            for (const subDoc of subArticlesSnap.docs) {
                const subData = subDoc.data();
                const subUpdates = {};
                if (subData.contentMarkdown) subUpdates.contentMarkdown = renovateContent(subData.contentMarkdown, title, regionTitle);
                if (subData.content) subUpdates.content = renovateContent(subData.content, title, regionTitle);
                if (Object.keys(subUpdates).length > 0) await subDoc.ref.update(subUpdates);
            }
        }
    }
    console.log('\n✅ All articles renovated with unique per-page content!');
}

start().catch(console.error);
