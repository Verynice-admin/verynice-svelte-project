
import { adminDB } from './firebaseAdmin';
import type { DestinationPrompt } from './destinationPrompts';

// KEYS
const UNSPLASH_KEY = 'dpb1QaJPK4n4IRfjlUrK3_lcfqLtxl-kE5-NEz3ali8';
const PEXELS_KEY = 'BH27zg0lfyEy7Gu6kHvC5QMPr99mUSKvud9JZwS5dMxHZFF9sdhB0yu3';

async function fetchStockImages(query: string, count: number = 6, fallbackUrl: string): Promise<Array<{ url: string, caption: string, photographer: string }>> {
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
        console.warn(`Stocks failed for ${query}. Using Falback.`);
        for (let i = 0; i < count; i++) {
            images.push({ url: fallbackUrl, caption: query, photographer: 'Common Archive' });
        }
    }

    return images;
}

export async function generateDestinationPage(prompt: DestinationPrompt) {
    if (!adminDB) throw new Error("Firebase Admin not initialized");
    const db = adminDB;

    console.log(`[Agent] Generating ${prompt.data.title}...`);

    // 1. Fetch Images
    const stockImages = await fetchStockImages(prompt.data.mainTitle || prompt.data.title, 8, prompt.data.imageFallback);
    const imgMain = stockImages[0].url;
    const imgHero = stockImages[1]?.url || imgMain;

    // 2. Prepare Data
    // Main Doc Data
    const mainDocData = {
        title: prompt.data.title,
        mainTitle: prompt.data.mainTitle || prompt.data.title,
        slug: prompt.slug,
        authorId: prompt.data.authorId,
        tier: prompt.data.tier,
        image: { publicId: imgMain, alt: prompt.data.title },
        headerBackgroundPublicId: imgHero,
        headerDescription: prompt.data.headerDescription || '',
        shortDescription: prompt.data.shortDescription || '',
        description: prompt.data.description || '',
        location: prompt.data.location || { name: "Kazakhstan", type: "Destination" },
        seo: prompt.data.seo || { title: prompt.data.title, description: prompt.data.shortDescription },
        createdAt: new Date().toISOString()
    };

    // 3. CLEANUP (Duplicate Prevention)
    // Delete wrong path if exists
    if (prompt.deletePath) {
        const wrongDocRef = db.doc(prompt.deletePath);
        const wrongSnap = await wrongDocRef.get();
        if (wrongSnap.exists) {
            console.log(`[Agent] Removing incorrect doc at ${prompt.deletePath}`);
            const subCols = ['articles', 'keyFacts', 'faq', 'map', 'video', 'photoGallery'];
            for (const col of subCols) {
                const snap = await wrongDocRef.collection(col).get();
                if (!snap.empty) {
                    const batch = db.batch();
                    snap.docs.forEach(d => batch.delete(d.ref));
                    await batch.commit();
                }
            }
            await wrongDocRef.delete();
        }
    }

    // Cleanup Target Path to avoid duplicates
    const docRef = db.doc(prompt.targetPath);
    const targetCollectionsToDelete = ['articles', 'keyFacts', 'faq', 'map', 'video', 'photoGallery'];
    for (const colName of targetCollectionsToDelete) {
        const snap = await docRef.collection(colName).get();
        if (!snap.empty) {
            const batch = db.batch();
            snap.docs.forEach(d => batch.delete(d.ref));
            await batch.commit();
        }
    }

    // 4. WRITE NEW DATA
    const batch = db.batch();

    // Ensure document exists
    batch.set(docRef, { ...mainDocData, id: prompt.slug, type: 'destination' }, { merge: true });

    // Articles
    prompt.data.articles.forEach((item, idx) => {
        // Find image for article if not provided?
        // Let's use rest of stock images
        const artImg = stockImages[idx + 2] || stockImages[0];
        const artData = {
            ...item,
            articleId: `section-${idx + 1}`,
            images: [{ publicId: artImg.url, alt: item.title }]
        };
        const ref = docRef.collection('articles').doc(artData.articleId);
        batch.set(ref, artData);
    });

    // Key Facts
    prompt.data.keyFacts.forEach((item, idx) => {
        const ref = docRef.collection('keyFacts').doc(`fact-${idx}`);
        batch.set(ref, item);
    });

    // FAQ
    if (prompt.data.faqs) {
        const ref = docRef.collection('faq').doc('main');
        batch.set(ref, { title: "Frequently Asked Questions", items: prompt.data.faqs });
    }

    // Map
    if (prompt.data.map) {
        const ref = docRef.collection('map').doc('main');
        batch.set(ref, { ...prompt.data.map, coordinates: { lat: prompt.data.map.lat, lng: prompt.data.map.lng } });
    }

    // Video
    // The existing video logic was part of the batch, but the new logic uses await directly.
    // To maintain consistency and avoid mixing batch with direct awaits for subcollections within the main batch,
    // I will adapt the new video logic to use the batch if possible, or execute it after the main batch.
    // Given the instruction's structure, it implies these should be separate operations or part of a larger sequence.
    // For now, I'll keep the new video logic as direct `await set` calls, which means the main batch needs to be committed before these.
    // However, the instruction places it *before* the main batch.commit(). This implies the main batch should not contain these.
    // Let's assume the instruction wants these to be separate `set` operations outside the initial batch.


    // Commit the first batch (Articles, KeyFacts, FAQ, Map)
    await batch.commit();

    // 5. WRITE REMAINING SUBCOLLECTIONS (Video, Gallery, Related, Comments, Questions)
    // We use a new batch or direct writes.
    const batch2 = db.batch();

    // Video
    const videoData = prompt.data.video || { url: "", title: "", provider: "youtube" };
    batch2.set(docRef.collection('video').doc('main'), videoData);

    // Gallery
    const galleryParams = {
        title: "Photo Gallery",
        photos: stockImages.map(img => ({ publicId: img.url, caption: img.caption, alt: img.caption }))
    };
    batch2.set(docRef.collection('photoGallery').doc('main'), galleryParams);

    // Related Posts (Seed 3 generic)
    const relatedRef = docRef.collection('relatedPosts');
    const placeholders = [
        { id: 'baiterek-tower', title: 'Baiterek Tower', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Baiterek_tower_Astana.jpg', tier: 1, type: 'landmark', slug: 'baiterek-tower' },
        { id: 'shymbulak-ski-resort', title: 'Shymbulak', image: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Shymbulak_Ski_Resort.jpg', tier: 1, type: 'nature', slug: 'shymbulak-ski-resort' },
        { id: 'charyn-canyon', title: 'Charyn Canyon', image: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Charyn_Canyon.jpg', tier: 1, type: 'nature', slug: 'charyn-canyon' }
    ];
    // Filter self
    const validRelated = placeholders.filter(p => p.slug !== prompt.slug);
    validRelated.forEach((post, index) => {
        batch2.set(relatedRef.doc(post.slug), { ...post, order: index + 1 });
    });

    // Comments
    batch2.set(docRef.collection('comments').doc('init'), {
        text: "Welcome to the discussion!",
        user: "System",
        date: new Date().toISOString(),
        visible: false
    });

    // User Questions
    batch2.set(docRef.collection('user_questions').doc('init'), {
        question: "Ask a question about this destination.",
        answer: "",
        date: new Date().toISOString(),
        visible: false
    });

    await batch2.commit();

    console.log(`[Agent] SUCCESS: Generated ${prompt.data.title} at ${prompt.targetPath}`);

    return { success: true, path: prompt.targetPath };
}

