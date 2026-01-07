import { adminDB } from '$lib/server/firebaseAdmin';

// --- API KEYS ---
const PEXELS_KEY = 'BH27zg0lfyEy7Gu6kHvC5QMPr99mUSKvud9JZwS5dMxHZFF9sdhB0yu3';
const UNSPLASH_KEY = 'dpb1QaJPK4n4IRfjlUrK3_lcfqLtxl-kE5-NEz3ali8';
const PIXABAY_KEY = '53876619-d093f9b4c09d1b605177e5f99';

// --- HELPER: FETCH IMAGE ---
async function fetchStockImage(query: string): Promise<string | null> {
    console.log(`[AI Agent] Verifying stock image availability for: "${query}"...`);

    // 1. Try Unsplash
    try {
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_KEY}`);
        if (res.ok) {
            const json = await res.json();
            if (json.results && json.results.length > 0) {
                console.log(`[AI Agent] Found Unsplash image for "${query}".`);
                return json.results[0].urls.regular;
            }
        }
    } catch (e) { console.warn("Unsplash fetch failed", e); }

    // 2. Try Pexels
    try {
        const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
            headers: { Authorization: PEXELS_KEY }
        });
        if (res.ok) {
            const json = await res.json();
            if (json.photos && json.photos.length > 0) {
                console.log(`[AI Agent] Found Pexels image for "${query}".`);
                return json.photos[0].src.large2x;
            }
        }
    } catch (e) { console.warn("Pexels fetch failed", e); }

    // 3. Try Pixabay
    try {
        const res = await fetch(`https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=3`);
        if (res.ok) {
            const json = await res.json();
            if (json.hits && json.hits.length > 0) {
                // Pixabay hits can be weird, pick one
                console.log(`[AI Agent] Found Pixabay image for "${query}".`);
                return json.hits[0].largeImageURL;
            }
        }
    } catch (e) { console.warn("Pixabay fetch failed", e); }

    console.warn(`[AI Agent] No stock image found for "${query}". Using fallback.`);
    return null;
}

export async function createAltynEmelPage() {
    if (!adminDB) {
        console.error('Firebase Admin not initialized');
        return;
    }

    console.log("[AI Agent] Starting Content Enhancement Process...");

    // --- FETCH IMAGES DYNAMICALLY ---
    const imgSingingDune = await fetchStockImage("Singing Sand Dune Desert Kazakhstan") || "/content/altyn-emel-1.png";
    const imgAktau = await fetchStockImage("Red Mountains Desert Canyon Kazakhstan") || "/content/altyn-emel-2.png";
    const imgKatutau = await fetchStockImage("Volcanic Rock Formation Desert") || "/content/altyn-emel-3.png";
    const imgKulan = await fetchStockImage("Wild Donkey Kulan Nature") || "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Equus_hemionus_kulan_-_Altyn-Emel_National_Park.jpg/1280px-Equus_hemionus_kulan_-_Altyn-Emel_National_Park.jpg";
    const imgBesshatyr = await fetchStockImage("Ancient Burial Mounds Steppe Stones") || "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Besshatyr.jpg/1280px-Besshatyr.jpg";
    const imgIliRiver = await fetchStockImage("River in Desert Steppe Kazakhstan") || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Ili_River_Altyn_Emel.jpg/1280px-Ili_River_Altyn_Emel.jpg";

    // Header Image
    const imgHeader = await fetchStockImage("Kazakhstan Singing Dune Sunset Landscape") || imgSingingDune;

    const data = {
        docId: "altyn-emel-national-park",
        regionId: "section-almaty-and-nearby",
        firestorePath: "pages/destinationsPage/articles/section-almaty-and-nearby/attractions/altyn-emel-national-park",
        data: {
            title: "Altyn-Emel National Park",
            tier: 1,
            image: { publicId: imgHeader, alt: "Altyn-Emel National Park" },
            mainTitle: "Altyn-Emel: Where the Desert Sings",
            headerDescription: "Journey into a Martian landscape of singing sands, multi-colored mountains, and ancient nomadic mysteries. A UNESCO World Heritage masterpiece.",
            headerBackgroundPublicId: imgHeader, // Using URL directly supported by our utils
            heroImagePublicId: imgHeader,
            location: {
                name: "Almaty Region, Kazakhstan",
                type: "National Park"
            },
            seo: {
                title: "Altyn-Emel National Park - The Singing Dune & Aktau Mountains",
                description: "Experience the magic of Altyn-Emel. Listen to the Singing Dune, hike the red Aktau Mountains, and discover the Stonehenge of the Steppes."
            },
            authorId: "aliya-askar"
        },
        subcollections: {
            articles: [
                {
                    title: "The Singing Dune: Nature's Pipe Organ",
                    order: 1,
                    articleId: "section-singing-dune",
                    year: "THE LEGEND",
                    contentMarkdown: "**It starts as a low hum, barely audible over the wind. Then, as you slide down the slope, the sand begins to roar.**\n\nStanding 150 meters high and stretching for three kilometers, the **Singing Dune (Akkum-Kalkan)** is one of nature's most bizarre auditory phenomena. Unlike ordinary dunes that migrate with the wind, this golden pyramid has stood immovable for thousands of years, trapped in a wind tunnel between the *Big Kalkan* and *Small Kalkan* mountains.\n\n**The Myth of the Sleeping Devil:**\nLocal legends whisper that this is no ordinary pile of sand. They say the great *Shaitan* (Devil), exhausted from mischief, fell asleep here on his way home. Over centuries, the desert winds buried him, and the deep groans you hear are his restless snores. Another tale speaks of the legendary Genghis Khan and his warriors, buried in their golden armor beneath the crest, singing eternal battle songs when the sand moves.\n\n**The Reality:**\nIn dry weather, the friction of millions of electrified sand grains rubbing together creates a vibration that resonates like a pipe organ or a low-flying jet aircraft (up to 105 decibels). Climbing the razor-sharp ridge is a test of endurance—the sand shifts and swallows your footsteps—but the summit offers a reward unmatched in the steppe: a 360-degree panorama of the violet mountains and the shimmering Ili River winding like a silver snake through the desert."
                },
                {
                    title: "Aktau Mountains: Walking on Mars",
                    order: 2,
                    articleId: "section-geology",
                    year: "GEOLOGY",
                    contentMarkdown: "**If you have ever wanted to visit another planet, Aktau is the closest you will get on Earth.**\n\nThese are not mountains in the traditional sense. They are the exposed, sun-baked floor of the ancient Tethys Ocean, which covered this land 400 million years ago. As you walk through the labyrinth of canyons, you are walking through time itself.\n\n**A Kaleidoscope of Time:**\nThe hills are banded in vivid, surreal stripes of blood-red, chalk-white, and burnt orange. Each color represents a different geological era, a \"layer cake\" of history preserved in clay. At sunset, the landscape ignites—the red clay glows as if burning from within, creating a photographer's paradise.\n\nThis is a paleontologist's playground. The crystallized bones of prehistoric beasts—giant rhinos (*Brontotherium*), primitive crocodiles, and ancient turtles are still washing out of the canyon walls today. It is a silent, eerie, and utterly magnificent place where the only sound is the crunch of crystallized gypsum under your boots."
                },
                {
                    title: "The Legacy of Iron Kings & Wild Spirits",
                    order: 3,
                    articleId: "section-history-wildlife",
                    year: "LIVING HISTORY",
                    contentMarkdown: "Altyn-Emel is a land where the spirits of the past watch over the creatures of the present.\n\n**The Stonehenge of the Steppes:**\nScattered across the plain lies the *Besshatyr* (Five Tents) necropolis, the final resting place of the mighty Saka (Scythian) warrior-kings from the 1st millennium BC. Thirty-one massive black-stone barrows rise from the earth, surrounded by mysterious *menhirs*—standing stones arranged in sun-worshipping circles. Standing here, you can almost feel the presence of the fierce nomads who once ruled the Eurasian steppe.\n\n**A Safari of Rare Beasts:**\nToday, the only armies roaming these plains are herds of **Turkmen Kulan** (wild donkeys). Once extinct in the wild, they were reintroduced here and now thrive in the thousands. Keep your eyes on the horizon for the swift **Goitered Gazelle** (*Djeiran*) leaping through the brush, and scan the rocky crags for the magnificent spread of the **Golden Eagle's** wings or the massive **Bearded Vulture**. If fortune smiles on you, you might even spot the elusive *Przewalski's Horse*, the last truly wild horse on the planet."
                },
                {
                    title: "The Journey: How to Get There",
                    order: 4,
                    articleId: "section-journey",
                    year: "TRAVEL GUIDE",
                    contentMarkdown: "**The road to Altyn-Emel is an adventure in itself.**\n\n**Getting There from Almaty:**\nThe park lies approximately 260km north of Almaty. The drive takes about 4–5 hours on the highway towards Taldykorgan, before turning off towards *Basshi* village. \n*   **The Route:** Almaty → Kapchagay → Saryozek → Altyn-Emel Pass → Basshi.\n*   **The Vehicle:** While a standard car can reach Basshi village, **exploring the park requires a 4x4 SUV**. The tracks to the Singing Dune and Aktau Mountains are rough, washboard gravel roads, often 50-70km apart.\n\n**Logistics & Tips:**\n1.  **Permits:** You MUST obtain a permit. This can be done at the park office in Basshi or pre-arranged via tour agencies in Almaty.\n2.  **Water:** There are *no* shops inside the park gates. Bring at least 3-4 liters of water per person per day. The desert heat is unforgiving.\n3.  **Best Time:** April-May (for green steppes and tulips) or September-October (for stable weather and fruits). Summer can be blisteringly hot (40°C+).\n4.  **Fuel:** Fill up your tank completely in Saryozek. There are no gas stations past Basshi."
                }
            ],
            keyFacts: [
                { label: "Status", value: "UNESCO Biosphere Reserve", icon: "award", order: 1 },
                { label: "Size", value: "4,600 km² (Massive)", icon: "map", order: 2 },
                { label: "Established", value: "1996", icon: "calendar", order: 3 },
                { label: "Top Sights", value: "Singing Dune, Aktau Mts", icon: "camera", order: 4 },
                { label: "Wildlife", value: "Kulan, Gazelle, Eagle", icon: "eye", order: 5 },
                { label: "Distance", value: "260km from Almaty (~4h)", icon: "map-pin", order: 6 }
            ],
            map: {
                coordinates: { lat: 43.892, lng: 78.636 },
                title: "Altyn-Emel National Park"
            },
            video: {
                url: "https://youtu.be/3KbaD997I1s?si=iyrSeKY3fMW0G6xK",
                title: "Experience Altyn-Emel",
                provider: "youtube"
            },
            faq: {
                title: "Planning Your Visit",
                items: [
                    {
                        question: "How much time do I need?",
                        answer: "At least 2 days. The park is vast, and the Singing Dune and Aktau Mountains are 70km apart on rough roads. A one-day trip is exhausting and rushed."
                    },
                    {
                        question: "Where can I stay?",
                        answer: "There are simple guesthouses in Basshi village (the park HQ) and designated camping spots at the sites. Camping under the stars at Aktau mountains is an unforgettable experience."
                    },
                    {
                        question: "Do I need a 4x4?",
                        answer: "Yes, absolutely. The roads inside the park are unpaved gravel and sand. A high-clearance SUV is required."
                    },
                    {
                        question: "Is there water/food inside?",
                        answer: "No. You must bring all your own water (at least 3-4 liters per person per day) and food. There are no cafes inside the park gates."
                    }
                ]
            },
            photoGallery: {
                title: "The Colors of Altyn-Emel",
                photos: [
                    { url: imgSingingDune, caption: "The massive ridge of the Singing Dune at sunset", alt: "Singing Dune Ridge" },
                    { url: imgAktau, caption: "The alien-like red clay of Aktau Mountains", alt: "Aktau Mountains Red" },
                    { url: imgKatutau, caption: "Volcanic sculptures of Katutau", alt: "Katutau Rock" },
                    { url: imgKulan, caption: "A herd of Kulan roaming the steppe", alt: "Kulan Wildlife" },
                    { url: imgBesshatyr, caption: "The ancient Saka burial mounds of Besshatyr", alt: "Besshatyr" },
                    { url: imgIliRiver, caption: "The Ili River flowing through the park", alt: "Ili River" }
                ]
            },
            relatedPosts: [
                { id: "section-charyn-canyon", title: "Charyn Canyon", category: "Nearby", imagePublicId: "content/locations/charyn/header-main", url: "/destinations/charyn-canyon" },
                { id: "section-kolsai-lakes", title: "Kolsai Lakes", category: "Nearby", imagePublicId: "content/locations/kolsai/header-main", url: "/destinations/kolsai-lakes" },
                { id: "section-almaty-city", title: "Almaty City", category: "Urban Hub", imagePublicId: "content/locations/almaty/header-main", url: "/destinations/almaty-city" }
            ],
            comments: [],
            user_questions: []
        }
    };

    try {
        const docRef = adminDB.doc(data.firestorePath);

        await docRef.set({
            id: data.docId,
            ...data.data
        });

        const batch = adminDB.batch();

        // Helper to batch items
        const addItems = (collectionName: string, items: any[] | null | undefined, idField: string | null = null) => {
            if (items) {
                items.forEach((item: any, index: number) => {
                    const docId = idField ? (item[idField] || item.id) : `item-${index}`;
                    const ref = docRef.collection(collectionName).doc(docId);
                    batch.set(ref, item);
                });
            }
        };

        // DELETE EXISTING ARTICLES FIRST to avoid duplicates/ghosts
        const articlesCollection = docRef.collection('articles');
        const existingArticles = await articlesCollection.get();
        existingArticles.forEach((doc) => {
            batch.delete(doc.ref);
        });

        addItems('articles', data.subcollections.articles, 'articleId');

        // Key Facts (Key: fact-0, fact-1...)
        if (data.subcollections.keyFacts) {
            data.subcollections.keyFacts.forEach((item, index) => {
                const ref = docRef.collection('keyFacts').doc(`fact-${index}`);
                batch.set(ref, item);
            });
        }

        // Related Posts (Key: post-0...)
        if (data.subcollections.relatedPosts) {
            data.subcollections.relatedPosts.forEach((item, index) => {
                const ref = docRef.collection('relatedPosts').doc(`post-${index}`);
                batch.set(ref, { ...item, order: index + 1 });
            });
        }

        // Singletons
        if (data.subcollections.map) batch.set(docRef.collection('map').doc('main'), data.subcollections.map);
        if (data.subcollections.video) batch.set(docRef.collection('video').doc('main'), data.subcollections.video);
        if (data.subcollections.faq) batch.set(docRef.collection('faq').doc('main'), data.subcollections.faq);
        if (data.subcollections.photoGallery) batch.set(docRef.collection('photoGallery').doc('main'), data.subcollections.photoGallery);

        await batch.commit();
        console.log('Successfully re-seeded Altyn-Emel data with premium content!');

    } catch (e) {
        console.error('Error uploading Altyn-Emel data:', e);
    }
}
