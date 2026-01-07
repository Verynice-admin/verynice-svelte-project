import { adminDB } from './firebaseAdmin';

// --- API KEYS ---
const PEXELS_KEY = 'BH27zg0lfyEy7Gu6kHvC5QMPr99mUSKvud9JZwS5dMxHZFF9sdhB0yu3';
const UNSPLASH_KEY = 'dpb1QaJPK4n4IRfjlUrK3_lcfqLtxl-kE5-NEz3ali8';
const PIXABAY_KEY = '53876619-d093f9b4c09d1b605177e5f99';

// --- HELPER: FETCH IMAGES ---
async function fetchStockImages(query: string, count: number = 6): Promise<Array<{ url: string, caption: string, photographer: string }>> {
    const images: Array<{ url: string, caption: string, photographer: string }> = [];

    // 1. Unsplash
    try {
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape&client_id=${UNSPLASH_KEY}`);
        if (res.ok) {
            const json = await res.json();
            json.results.forEach((img: any) => {
                images.push({
                    url: img.urls.regular,
                    caption: img.description || img.alt_description || query,
                    photographer: img.user.name
                });
            });
        }
    } catch (e) { console.warn("Unsplash fetch failed", e); }

    // 2. Pexels (if needed)
    if (images.length < count) {
        try {
            const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count - images.length}&orientation=landscape`, {
                headers: { Authorization: PEXELS_KEY }
            });
            if (res.ok) {
                const json = await res.json();
                json.photos.forEach((img: any) => {
                    images.push({
                        url: img.src.large2x,
                        caption: img.alt || query,
                        photographer: img.photographer
                    });
                });
            }
        } catch (e) { console.warn("Pexels fetch failed", e); }
    }

    // Fallbacks
    if (images.length === 0) {
        console.warn("Stock API failed or returned no results. Using Wikimedia fallback.");
        const FALLBACK_URL = "https://upload.wikimedia.org/wikipedia/commons/9/98/Charyn_Canyon%2C_Kazakhstan.jpg";
        for (let i = 0; i < count; i++) {
            images.push({ url: FALLBACK_URL, caption: 'Charyn Canyon', photographer: 'Wikimedia Commons' });
        }
    }

    return images;
}

export async function seedCharynCanyon() {
    if (!adminDB) throw new Error("Firebase Admin not initialized");
    const db = adminDB;
    const PAGE_TITLE = "Charyn Canyon";
    const PAGE_SLUG = "charyn-canyon";

    console.log(`Starting seed for ${PAGE_TITLE}...`);

    // Fetch Images
    const stockImages = await fetchStockImages("Charyn Canyon Kazakhstan", 8);
    const imgMain = stockImages[0]?.url || 'content/locations/charyn/charyn-main';
    const imgHero = stockImages[1]?.url || imgMain;
    const imgValley = stockImages[2]?.url || imgMain;

    const data = {
        data: {
            mainTitle: "Charyn Canyon: The Valley of Castles",
            headerDescription: "Kazakhstan's own Grand Canyon. A surreal landscape of red sandstone sculptures millions of years in the making.",
            headerBackgroundPublicId: imgHero,

            // List View Props
            title: PAGE_TITLE,
            tier: 1,
            image: { publicId: imgMain, alt: "Charyn Canyon" }, // Object format as requested
            shortDescription: "Explore the Valley of Castles in this spectacular red canyon.",
            description: "Known as the Grand Canyon's little brother, Charyn Canyon offers breathtaking views, hiking trails, and the famous Valley of Castles.",

            slug: PAGE_SLUG,
            seo: {
                title: "Charyn Canyon Guide | VeryNice.kz",
                description: "Complete travel guide to Charyn Canyon. Hiking the Valley of Castles, getting there from Almaty, and essential tips."
            },
            location: { name: "Almaty Region", type: "National Park" },
            articleViews: 890,
            articleLikes: 245,
            articleComments: 18,
            authorId: "aliya-askar" // CORRECTED AUTHOR
        },
        subcollections: {
            articles: [
                {
                    title: "The Valley of Castles",
                    articleId: "section-valley-of-castles",
                    order: 1,
                    type: "article",
                    contentMarkdown: `
The **Valley of Castles (Dolina Zamkov)** is the undeniable masterpiece of Charyn Canyon. For over 2 kilometers, the canyon walls rise vertically, sculpted by wind and water into shapes that defy logic—ancient fortresses, monolithic towers, and mythical beasts frozen in stone.

Walking the canyon floor gives you a sense of scale that is humbling. The red sedimentary layers, stacked like pages in a history book, glow with an intense, fiery orange at sunset and sunrise. It is a photographer's paradise. The path winds gently towards the Charyn River, where the arid heat suddenly gives way to the refreshing cool of the water and the shade of willow trees—a true oasis at the end of a Martian journey.
`,
                    images: [{ publicId: imgValley, alt: "Valley of Castles" }]
                },
                {
                    title: "Legends of the Witches",
                    articleId: "section-legends",
                    order: 2,
                    type: "article",
                    contentMarkdown: `
Charyn is not just rock and dust; it is a place steeped in folklore. Locals speak of the **"Witch's Canyon"** (or Witch's Gorge), a darker, narrower side canyon.

Legend says that late at night, witches fly through these gorges, their cackles echoing against the walls. Some stories warn that these spirits lure unsuspecting travelers to the cliff edges, while others speak of **red wolves**—magical creatures that guard the canyon's secrets. Whether you believe the myths or not, standing in the silence of the canyon at twilight, it is easy to feel the ancient, watchful presence of the landscape.
`
                },
                {
                    title: "A 12-Million-Year History",
                    articleId: "section-history",
                    order: 3,
                    year: "12 Million Years",
                    contentMarkdown: `
Charyn Canyon is a geological time capsule formed over **12 million years ago**. While the Grand Canyon in the USA is etched by the Colorado River, Charyn was carved by the Charyn River slicing through the flat steppe.

The canyon reaches depths of up to **300 meters**. The exposed layers reveal a history that stretches back to the Paleogene period. The absolute bottom consists of ancient volcanic lava rocks, while the upper towers are soft sedimentary debris.

A few kilometers away lies the **Sogdian Ash Grove** (*Relic Ash Grove*). This protected forest is a biological miracle—a pocket of ash trees that survived the last Ice Age. Some of these trees are rumored to be over 300 years old, living fossils in a harsh desert environment.
`
                },
                {
                    title: "Getting There & Getting Around",
                    articleId: "section-getting-there",
                    order: 4,
                    contentMarkdown: `
Charyn Canyon is located roughly **200 km east of Almaty**, making it a long but rewarding day trip.

*   **By Car (Recommended):** The drive takes 3.5 to 4 hours via the Kulja Ky tract. The highway is mostly paved and scenic. The final 10km is off-road but generally passable for sedans in dry weather.
*   **Guided Tours:** This is the most popular choice. Tours often combine Charyn with **Black Canyon**, **Kolsai Lakes**, and **Kaindy Lake** in a 2-day loop.
*   **The "Eco-Taxi":** If you don't want to hike the 2.5km back *up* the canyon in the heat, local "Eco-Taxis" (shuttles) run from the river to the parking lot for a small fee (approx. 500-1000 KZT).
*   **For Adventurers:** You can take a shared taxi / marshrutka towards Kegen or Saty from Almaty's Sayakhat station. Ask the driver to drop you at the "Charyn turn-off" (*Charyn Povorot*). From there, it's a 10km hitchhike or hike to the entrance—only for the prepared!
`
                },
                {
                    title: "Survival Guide",
                    articleId: "section-tips",
                    order: 5,
                    contentMarkdown: `
*   **Heat Warning:** In summer, temperatures on the canyon floor can exceed **40°C (104°F)**. There is almost no shade until you reach the river. Bring a hat, sunscreen, and at least 2 liters of water.
*   **Wildlife:** Watch your step! The canyon is home to lizards, steppe eagles, and occasionally snakes or scorpions in the rocky crevices.
*   **Best Light:** Arrive at **sunrise** or **sunset** for the "Golden Hour." Midday sun flattens the colors and makes the heat unbearable.
*   **Stay Overnight:** There is an Eco-Park at the river bank with bungalows and yurts. Sleeping under the stars in the sheer silence of the canyon is an unforgettable experience.
`
                }
            ],
            keyFacts: [
                { label: "Best Time", value: "Apr-May, Sep-Oct", icon: "calendar", order: 1 },
                { label: "Distance", value: "200km from Almaty", icon: "map-pin", order: 2 },
                { label: "Entrance", value: "800 KZT", icon: "tag", order: 3 },
                { label: "Duration", value: "1 Day", icon: "clock", order: 4 }
            ],
            map: {
                title: "Charyn Canyon",
                coordinates: { lat: 43.3582, lng: 79.0833 },
                zoom: 12
            },
            video: {
                url: "", // User requested to keep empty
                title: "Charyn Canyon Cinematic",
                provider: "youtube"
            },
            photoGallery: {
                title: "Photo Gallery",
                photos: stockImages.map(img => ({
                    publicId: img.url,
                    caption: img.caption,
                    alt: img.caption
                }))
            },
            // ADDED FAQ SECTION
            faq: {
                title: "Frequently Asked Questions",
                items: [
                    {
                        question: "Is the hike difficult?",
                        answer: "No, the hike through the Valley of Castles is relatively easy and flat (about 2km one way). The return trip requires walking back up, or you can take the local 'eco-taxi' shuttle for a small fee."
                    },
                    {
                        question: "Can I bring my drone?",
                        answer: "Drone usage is generally allowed in the National Park, but regulations change. Always check with the checkpoint rangers upon entry."
                    },
                    {
                        question: "Is there food available?",
                        answer: "There is a small eco-park / cafe area at the bottom of the canyon near the river, offering basic meals and drinks (shashlik, tea). However, bringing your own water and snacks is highly recommended."
                    },
                    {
                        question: "Can I swim in the river?",
                        answer: "The Charyn River is fast-flowing and cold. Swimming is dangerous and generally discouraged, though some people dip their feet in calm areas."
                    }
                ]
            }
        }
    };

    // WRITING TO FIRESTORE
    // CORRECT PATH (Nested)
    const DESTINATION_PATH = "pages/destinationsPage/articles/section-almaty-and-nearby/attractions/charyn-canyon";
    const docRef = db.doc(DESTINATION_PATH);

    // 0. CLEANUP: Delete WRONG location if it exists (pages/destination-charyn-canyon)
    const wrongDocRef = db.collection('pages').doc(`destination-${PAGE_SLUG}`);
    const wrongDocSnap = await wrongDocRef.get();
    if (wrongDocSnap.exists) {
        console.log("Found incorrectly located document. Removing...");
        // Delete subcollections of wrong doc first
        const subCols = ['articles', 'keyFacts', 'faq', 'map', 'video', 'photoGallery'];
        for (const col of subCols) {
            const snap = await wrongDocRef.collection(col).get();
            if (!snap.empty) {
                const batchDel = db.batch();
                snap.docs.forEach(d => batchDel.delete(d.ref));
                await batchDel.commit();
            }
        }
        await wrongDocRef.delete();
        console.log("Removed incorrect document.");
    }

    // 0.5. CLEANUP: Delete existing subcollections on the CORRECT doc to prevent duplicates
    const collectionsToDelete = ['articles', 'keyFacts', 'faq', 'map', 'video', 'photoGallery'];
    for (const colName of collectionsToDelete) {
        const snap = await docRef.collection(colName).get();
        if (!snap.empty) {
            const deleteBatch = db.batch();
            snap.docs.forEach(d => deleteBatch.delete(d.ref));
            await deleteBatch.commit();
            console.log(`Cleaned up old ${colName} for ${PAGE_TITLE} at correct path`);
        }
    }

    const batch = db.batch();

    // Main Doc - Ensure it merges or overwrites correctly
    // We want to keep existing fields (like ID) but ensure our new data is distinct
    batch.set(docRef, { ...data.data, id: PAGE_SLUG, type: 'destination' }, { merge: true });

    // Subcollections
    if (data.subcollections.articles) {
        data.subcollections.articles.forEach((item, index) => {
            const ref = docRef.collection('articles').doc(item.articleId || `section-${index}`);
            batch.set(ref, item);
        });
    }
    if (data.subcollections.keyFacts) {
        data.subcollections.keyFacts.forEach((item, index) => {
            const ref = docRef.collection('keyFacts').doc(`fact-${index}`);
            batch.set(ref, item);
        });
    }
    if (data.subcollections.faq) {
        const ref = docRef.collection('faq').doc('main');
        batch.set(ref, data.subcollections.faq);
    }
    if (data.subcollections.map) {
        const ref = docRef.collection('map').doc('main');
        batch.set(ref, data.subcollections.map);
    }
    if (data.subcollections.video) {
        const ref = docRef.collection('video').doc('main');
        batch.set(ref, data.subcollections.video);
    }
    if (data.subcollections.photoGallery) {
        const ref = docRef.collection('photoGallery').doc('main');
        batch.set(ref, data.subcollections.photoGallery);
    }

    await batch.commit();
    console.log(`${PAGE_TITLE} seeded successfully!`);
}
