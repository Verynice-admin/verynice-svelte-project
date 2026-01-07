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
                console.log(`[AI Agent] Found Pixabay image for "${query}".`);
                return json.hits[0].largeImageURL;
            }
        }
    } catch (e) { console.warn("Pixabay fetch failed", e); }

    console.warn(`[AI Agent] No stock image found for "${query}". Using fallback.`);
    return null;
}

export async function createBigAlmatyLakePage() {
    if (!adminDB) {
        console.error('Firebase Admin not initialized');
        return;
    }

    console.log("[AI Agent] Starting Content Enhancement Process for Big Almaty Lake...");

    // --- FETCH IMAGES DYNAMICALLY ---
    const imgMain = await fetchStockImage("Big Almaty Lake turquoise reflection mountains") || "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Big_Almaty_Lake_2017.jpg/1280px-Big_Almaty_Lake_2017.jpg";
    const imgPipe = await fetchStockImage("Big Almaty Lake water pipeline road") || "https://cdn.pixabay.com/photo/2016/11/14/03/49/water-1822502_1280.jpg";
    const imgCosmic = await fetchStockImage("Tian Shan Astronomical Observatory") || "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Tian_Shan_Observatory.jpg/1280px-Tian_Shan_Observatory.jpg";
    const imgPeak = await fetchStockImage("Big Almaty Peak sunset") || imgMain;
    const imgWinter = await fetchStockImage("Big Almaty Lake winter snow") || "https://cdn.pixabay.com/photo/2019/12/26/10/44/mountain-4720268_1280.jpg";
    const imgRoad = await fetchStockImage("Mountain road serpentine Kazakhstan") || "https://cdn.pixabay.com/photo/2017/09/06/17/36/road-2722198_1280.jpg";

    const data = {
        docId: "big-almaty-lake",
        regionId: "section-almaty-and-nearby",
        firestorePath: "pages/destinationsPage/articles/section-almaty-and-nearby/attractions/big-almaty-lake",
        data: {
            title: "Big Almaty Lake",
            tier: 1,
            image: { publicId: imgMain, alt: "Big Almaty Lake" },
            mainTitle: "Big Almaty Lake: The Turquoise Pearl",
            headerDescription: "Perched at 2,511 meters, this alpine jewel shifts from deep teal to emerald green. A surreal, forbidden mirror high above the city clouds.",
            headerBackgroundPublicId: imgMain,
            heroImagePublicId: imgMain,
            location: {
                name: "Ile-Alatau National Park",
                type: "Alpine Lake"
            },
            seo: {
                title: "Big Almaty Lake (BAO) - Complete Guide 2024 | VeryNice.kz",
                description: "Discover Big Almaty Lake (BAO). How to hike the pipeline, visit the Space Station, and why you definitely cannot swim here."
            },
            authorId: "aliya-askar"
        },
        subcollections: {
            articles: [
                {
                    title: "The Turquoise Mirror",
                    order: 1,
                    articleId: "section-turquoise-mirror",
                    year: "THE VIEW",
                    contentMarkdown: "**It looks like someone spilled a giant bucket of paint into the mountains.**\n\nDepending on the time of day and the season, Big Almaty Lake (BAO) changes its mood. In early morning, it’s a deep, mysterious violet. By noon, under the bright Tian Shan sun, it transforms into an impossible, milky turquoise. This color comes from glacial sediment—rock flour—grinded down by the ancient ice that feeds the lake.\n\nSitting at **2,510 meters** above sea level, the lake is cradled by three majestic peaks: *Sovetov* (4,317m), *Ozyorny* (4,110m), and the iconic pyramid of *Big Almaty Peak* (3,681m). When the water is still, the reflection is so perfect it becomes difficult to tell where the mountains end and the water begins."
                },
                {
                    title: "Forbidden Waters",
                    order: 2,
                    articleId: "section-restrictions",
                    year: "RESTRICTIONS",
                    contentMarkdown: "**Look, but do not touch.**\n\nThis is the golden rule of BAO. As tempting as that cool, crystalline water looks on a hot summer day, **swimming is strictly prohibited**. \n\nWhy? This lake is the main natural reservoir for the city of Almaty. It provides drinking water to millions of people below. To protect this vital resource, the lake is guarded by patrols, and stepping too close to the water's edge can result in a whistle from a guard or a fine. \n\nIt is also a **border zone** area (located less than 10km from the Kyrgyzstan border). While you don't need a special permit to visit the lake itself, hiking further south towards the Ozerny Pass technically requires your passport and border zone documentation. Always carry your ID."
                },
                {
                    title: "The Cosmic Watchmen",
                    order: 3,
                    articleId: "section-cosmic-station",
                    year: "SCIENCE",
                    contentMarkdown: "If you look up from the lake, you'll see two strange, futuristic domes perched on the ridge above. This is the **Tian Shan Astronomical Observatory** and the **Cosmostation**.\n\nBuilt during the Soviet era to study the corona of the sun and radio astronomy, these stations are still active. The air here is thin and incredibly clear, free from the light pollution of the city below. \n\n**Pro Tip:** If you have a 4x4 or strong legs, you can continue past the lake up to the Cosmostation at 3,200m. The view from there looks *down* onto the lake, turning it into a tiny turquoise gem in a sea of granite. It feels like the edge of the world."
                },
                {
                    title: "The Road to the Clouds",
                    order: 4,
                    articleId: "section-travel-guide",
                    year: "TRAVEL GUIDE",
                    contentMarkdown: "**How do you get to this slice of paradise?**\n\nThe road to BAO is famous—and infamous. It is a winding mountain serpentine that snakes up the gorge.\n\n*   **By Car:** A taxi or private car can take you most of the way, but depending on the season, the road may be closed to private vehicles due to landslides or park restrictions. Often, you must park at the barrier below and walk the last 10km.\n*   **The Pipeline Hike:** For the adventurous, there is a shortcut. You can hike directly up the steep black water pipeline. It is grand, brutal cardio, and cuts the distance significantly, but be warned: it is VERY steep.\n*   **When to Go:** June to September is best for the turquoise color. In winter, the lake freezes over and disappears under snow, but the snowy landscape is equally magical."
                }
            ],
            keyFacts: [
                { label: "Altitude", value: "2,511 meters", icon: "activity", order: 1 },
                { label: "Depth", value: "30-40 meters", icon: "arrow-down", order: 2 },
                { label: "Water Source", value: "Glacial Melt", icon: "droplet", order: 3 },
                { label: "Swimming", value: "Strictly Prohibited", icon: "x-circle", order: 4 },
                { label: "Distance", value: "15km from City Center", icon: "map-pin", order: 5 },
                { label: "Border Zone", value: "Yes (Carry ID)", icon: "shield", order: 6 }
            ],
            map: {
                coordinates: { lat: 43.0506, lng: 76.9850 },
                title: "Big Almaty Lake"
            },
            video: {
                url: "https://youtu.be/KZaSwieNvvI?si=Em-w1jQ71LiqdBTS",
                title: "Big Almaty Lake Cinematic",
                provider: "youtube"
            },
            faq: {
                title: "Visitor Essentials",
                items: [
                    {
                        question: "Can I swim in the lake?",
                        answer: "No. It is a protected reservoir and border zone. Fines apply."
                    },
                    {
                        question: "Is the road open?",
                        answer: "It varies. Often, private cars are stopped at the park entrance (Ayusai) or the dam. Be prepared to hike 1-2 hours or hire a specific park taxi."
                    },
                    {
                        question: "What should I wear?",
                        answer: "Warm clothes! Even if it is 30°C in the city, it can be 10°C at the lake. The weather changes fast."
                    }
                ]
            },
            photoGallery: {
                title: "Photo Gallery",
                photos: [
                    { publicId: "content/pages/attractions/almaty/bao-almaty/BAO-Almaty", caption: "Big Almaty Lake", alt: "Big Almaty Lake View" },
                    { url: imgMain, caption: "The classic view of BAO with the three peaks", alt: "Big Almaty Lake Classic" },
                    { url: imgPipe, caption: "The famous water pipeline used by hikers", alt: "The Pipeline" },
                    { url: imgPeak, caption: "Big Almaty Peak reflecting in the water", alt: "Big Almaty Peak" },
                    { url: imgWinter, caption: "The frozen beauty of the lake in winter", alt: "Winter BAO" },
                    { url: imgRoad, caption: "The winding serpentine road to the top", alt: "Mountain Road" }
                ]
            },
            relatedPosts: [
                { id: "section-almaty-city", title: "Almaty City", category: "Urban Hub", imagePublicId: "content/locations/almaty/header-main", url: "/destinations/almaty-city" },
                { id: "section-shymbulak", title: "Shymbulak Ski Resort", category: "Nearby", imagePublicId: "content/locations/shymbulak/header-main", url: "/destinations/shymbulak-ski-resort" },
                // Note: Shymbulak might not exist yet, but we link it for future.
                { id: "section-altyn-emel", title: "Altyn-Emel", category: "Nature", imagePublicId: "content/locations/altyn-emel-national-park/header-main", url: "/destinations/altyn-emel-national-park" }
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

        // DELETE EXISTING ARTICLES FIRST
        const articlesCollection = docRef.collection('articles');
        const existingArticles = await articlesCollection.get();
        existingArticles.forEach((doc) => {
            batch.delete(doc.ref);
        });

        addItems('articles', data.subcollections.articles, 'articleId');

        // Other Collections
        if (data.subcollections.keyFacts) {
            data.subcollections.keyFacts.forEach((item, index) => {
                const ref = docRef.collection('keyFacts').doc(`fact-${index}`);
                batch.set(ref, item);
            });
        }
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
        console.log('Successfully re-seeded Big Almaty Lake data!');

    } catch (e) {
        console.error('Error uploading BAO data:', e);
    }
}
