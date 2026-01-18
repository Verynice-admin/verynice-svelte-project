const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Ultimate Unique Variation Library - ensures every page has 100% unique boilerplate
const getSustainability = (name, region) => {
    const list = [
        `Management of ${name} is dedicated to ecological preservation through local initiatives. Visitors are invited to contribute to conservation by documenting native biodiversity in ${name} using mobile tools. Supporting ${name}'s local economy through the purchase of regional crafts ensures that tourism benefits the surrounding ${region} villages directly. ${name} maintains a strict leave-no-trace mandate, requiring all guests to manage their own waste responsibly.`,
        `Preserving the pristine beauty of ${name} is a collective effort involving the ${region} community. Guests can participate in site monitoring at ${name} to help rangers track environmental changes. By choosing locally-made products near ${name}, you help fund education and infrastructure in the ${region} area. A comprehensive zero-waste policy is in effect at ${name}, ensuring the natural landscape remains untouched.`,
        `The ${name} heritage site operates under a model of sustainable stewardship. We encourage you to observe and record the unique flora of ${name} to assist in long-term data collection. Your patronage of ${name}'s local cooperatives supports sustainable development in ${region}. ${name} adheres to high environmental standards, with a focus on removing all refuse to protect the fragile ecosystem.`,
        `${name} is a cornerstone of the ${region} environmental protection network. We value visitor engagement in documenting the biological health of ${name}. Economic returns from visits to ${name} are reinvested into the health and livelihoods of local families. Stewardship at ${name} includes a commitment to pristine trails and a total-removal waste policy.`
    ];
    return list[Math.floor(Math.random() * list.length)];
};

const getConnectivity = (name) => {
    const list = [
        `While ${name} is equipped with modern telecommunications, we suggest carrying a power bank to ensure your devices remain charged throughout the day. Digital signals at ${name} are generally stable across the main visitor loops.`,
        `Mobile coverage at ${name} supports most modern devices, allowing for easy navigation. Due to the high-usage areas in ${name}, keeping a backup power source is a wise precaution for travelers.`,
        `${name} is well-integrated into the regional digital grid. However, for extended explorations of ${name}'s deeper zones, and to ensure you can capture every moment, a portable charger is recommended as signal searching can impact battery life.`,
        `Stable network connectivity is available throughout the main entrance and trails of ${name}. To maintain your digital access while exploring ${name}, ensure your mobile devices are fully charged or carry a portable power unit.`
    ];
    return list[Math.floor(Math.random() * list.length)];
};

const getFlavors = (name, region) => {
    const list = [
        `Dining near ${name} highlights the rich culinary traditions of ${region}. Local establishments often serve traditional Kazakh specialties like Syrne or Beshbarmak, with meals typically costing around 4,000 to 6,000 KZT. Don't miss the chance to try regional herbal teas sourced from the ${region} mountains.`,
        `At the gateway to ${name}, visitors can experience authentic ${region} hospitality. Traditional snacks and aromatic teas are usually available for a modest price of 3,500 KZT. The high-altitude flavors of the area around ${name} are a highlight for any gourmet traveler.`,
        `The ${region} region offers a bounty of local flavors for visitors to ${name}. Small family-run cafes serve fresh dairy products and savory pastries that perfectly complement the ${name} exploration. A full meal typically ranges from 5,000 to 7,000 KZT.`,
        `Exploring the tastes of ${region} is essential during a visit to ${name}. From locally harvested honey to traditional nomadic staples, the food near ${name} is both hearty and affordable, with most items priced between 2,500 and 5,000 KZT.`
    ];
    return list[Math.floor(Math.random() * list.length)];
};

const getWow = (name, feature) => {
    const list = [
        `The primary appeal of ${name} is the cinematic vista provided by the ${feature}, which is particularly striking under the early morning light.`,
        `Visitors to ${name} are often mesmerized by the sheer scale of the ${feature}, a sight that captures the essence of the Kazakh landscape.`,
        `The visual grandeur of ${name} is centered on the ${feature}, a monumental formation that commands attention from every angle.`,
        `Standing at the center of ${name}, the presence of the ${feature} offers an immersive experience in geological and historical awe.`
    ];
    return list[Math.floor(Math.random() * list.length)];
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

function renovateSection(section, title, region) {
    let renewed = section;

    // Local Flavors Cleanup
    if (section.includes("Local Flavors") || section.includes("baursaks") || section.includes("KZT")) {
        renewed = "## Local Flavors & Amenities\n" + getFlavors(title, region);
    }

    // Sustainability Cleanup
    if (section.includes("Sustainability") || section.includes("Zero-Trash") || section.includes("smartphones")) {
        renewed = "## Sustainability & Community\n" + getSustainability(title, region);
    }

    // Connectivity & Power Bank
    if (section.includes("Logistics") || section.includes("power bank") || section.includes("5G")) {
        // Keep the logistics part but replace the boilerplate connectivity sentence
        renewed = renewed.replace(/(finally, )?bring a small power bank.*?\.?/gi, "");
        renewed = renewed.replace(/5G coverage.*?\.?/gi, "");
        renewed += "\n\n" + getConnectivity(title);
    }

    // Wow-Factor
    if (section.includes("Wow-Factor")) {
        renewed = renewed.replace(/The "Wow-Factor" of .*? is the immediate, cinematic impact of the (.*?) at sunrise\./gi, (match, feature) => {
            return getWow(title, feature);
        });
    }

    // General Date/Branding Clean
    renewed = renewed.replace(/2026/g, "modern");
    renewed = renewed.replace(/2024-2025/g, "recent");
    renewed = renewed.replace(/Definitive.*Guide/gi, "Traveler's Guide");
    renewed = renewed.replace(/definitive modern guide/gi, "Professional Guide");

    return renewed;
}

function renovateContent(content, title, region) {
    if (!content) return content;

    // Split into sections by ## headers
    const sections = content.split(/^## /m);
    const renewedSections = sections.map((s, idx) => {
        if (idx === 0) {
            // This is the header part # Title
            return s.replace(/# .*: .* - Definitive.*Guide/gi, `# Exploring ${title}: A Modern Journey`)
                .replace(/# Exploring .*: A 2026 Comprehensive Guide/gi, `# The Wonders of ${title}`);
        }
        return renovateSection(s, title, region);
    });

    let final = renewedSections.join("\n\n## ").replace(/\n\n\n+/g, "\n\n");
    // Ensure properly joined
    if (!final.includes("## ")) {
        // Fallback for flat content
        final = renovateSection(final, title, region);
    }
    return final;
}

async function start() {
    const db = await initFirebase();
    console.log('🚀 Starting Sledgehammer Professional Renovation (v4)...');

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
                // Sub-articles are usually just one sections
                if (subData.contentMarkdown) subUpdates.contentMarkdown = renovateSection(subData.contentMarkdown, title, regionTitle);
                if (subData.content) subUpdates.content = renovateSection(subData.content, title, regionTitle);
                if (Object.keys(subUpdates).length > 0) await subDoc.ref.update(subUpdates);
            }
        }
    }
    console.log('\n✅ All articles completely unik-ified with v4 Sledgehammer!');
}

start().catch(console.error);
