
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

function loadServiceAccount() {
    const secretsPaths = [
        path.resolve('.secrets/serviceAccountKey.json'),
        path.resolve('.secrets/service-account.json')
    ];

    for (const secretsPath of secretsPaths) {
        try {
            if (fs.existsSync(secretsPath)) {
                console.log(`Found service account at: ${secretsPath}`);
                return require(secretsPath);
            }
        } catch (error) {
            console.error('Error reading service account:', error);
        }
    }
    return null;
}

const AUTHOR_ID = 'verynice-official';
const PAGE_ID = 'boratPage';

const DATA = {
    page: {
        seo: {
            title: 'About Borat | VeryNice.kz',
            description: 'The truth about Borat, the movie, and its impact on Kazakhstan.'
        },
        mainTitle: 'About Borat',
        headerDescription: 'The movie "Borat: Cultural Learnings of America for Make Benefit Glorious Nation of Kazakhstan" changed the world\'s view of us forever.',
        headerBackgroundPublicId: 'borat_header_bg',
        location: 'Glod, Romania (Not Kazakhstan)',
        articleViews: 69420,
        articleComments: 128,
        articleLikes: 3005,
        breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'About Borat' }],
        labels: { authorSectionTitle: 'Fact Checker' },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        authorId: AUTHOR_ID
    },
    author: {
        name: 'VeryNice Official',
        title: 'Content Team',
        bio: 'Providing accurate facts about our glorious nation.',
        profilePicturePublicId: 'logo',
        email: 'contact@verynice.kz',
        socialLinks: []
    },
    articles: [
        {
            id: 'movie-intro',
            title: 'The Movie: "Kazakhstan Heroes Country"',
            year: '2006',
            contentHTML: `<p>The movie, officially titled <strong>"Borat: Cultural Learnings of America for Make Benefit Glorious Nation of Kazakhstan"</strong> (often misremembered as "Kazakhstan Heroes Country"), was released in 2006. It features Sasha Baron Cohen as a fictional journalist traveling through the lush US and A.</p><p>It is important to understand: <strong>It is a fictitious movie</strong>. It has nothing to do with real territory, culture, or people of Kazakhstan.</p>`,
            order: 1
        },
        {
            id: 'filming-location',
            title: 'Romania, Not Kazakhstan',
            year: 'Facts',
            contentHTML: `<p>One of the biggest misconceptions is the setting. The "Kazakh village" scenes were actually filmed in <strong>Glod, Romania</strong>. The villagers were paid small amounts and arguably exploited, believing they were in a documentary about their hardships.</p><p>Real Kazakhstan is the 9th largest country in the world, with modern cities like Almaty and Astana, far removed from the dirt roads shown in the film.</p>`,
            order: 2
        },
        {
            id: 'public-reaction',
            title: 'How It Affected KZ People',
            year: 'Reaction',
            contentHTML: `<p>The reaction was intense. The government initially banned the movie and threatened legal action. Ordinary citizens were hurt by the portrayal of their nation as anti-semitic, misogynistic, and primitive.</p><p>However, it also put the country on the map. Tourism interest spiked. As time passed, the anger cooled, and the phrase <em>"Very Nice!"</em> became a tongue-in-cheek slogan for the tourism board.</p>`,
            order: 3
        },
        {
            id: 'fictitious-nature',
            title: 'A Fictional Character',
            year: 'Summary',
            contentHTML: `<p>Borat is not a real person. The language he speaks is not Kazakh (it's mostly Hebrew mixed with Polish). The customs are made up. The movie is a satire of American culture, using a "foreigner" as a mirror to expose American prejudices, rather than a genuine critique of Kazakhstan.</p>`,
            order: 4
        }
    ],
    keyFacts: [
        { label: 'Filming Location', value: 'Glod, Romania', order: 1 },
        { label: 'Released', value: '2006', order: 2 },
        { label: 'Actor', value: 'Sacha Baron Cohen', order: 3 },
        { label: 'Language Spoken', value: 'Hebrew & Armenian (Not Kazakh)', order: 4 },
        { label: 'Genre', value: 'Mockumentary / Black Comedy', order: 5 }
    ],
    video: {
        title: 'The "Very Nice!" Tourism Campaign',
        url: 'https://www.youtube.com/watch?v=4r93yO31U94'
    },
    map: {
        title: 'Actual Filming Location (Glod, Romania)',
        coordinates: { latitude: 45.2456, longitude: 25.4572 } // Firestore GeoPoints usually, but plain object here for script, converted if passed to GeoPoint constructor
    },
    photoGallery: {
        title: 'Fact vs Fiction',
        photos: [
            {
                imageUrl: "https://upload.wikimedia.org/wikipedia/en/3/39/Borat_ver2.jpg",
                caption: "The movie poster that started it all.",
                altText: "Borat Movie Poster"
            },
            {
                imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Almaty_Kazakhstan.jpg/1200px-Almaty_Kazakhstan.jpg",
                caption: "Real Kazakhstan: A modern, beautiful country.",
                altText: "City of Almaty"
            }
        ]
    },
    faq: {
        title: 'Common Questions',
        items: [
            {
                question: 'Is "Kazakhstan Heroes Country" a real movie?',
                answer: 'The actual title is "Borat: Cultural Learnings of America for Make Benefit Glorious Nation of Kazakhstan". It is a fictional mockumentary.'
            },
            {
                question: 'Was it filmed in Kazakhstan?',
                answer: 'No. The village scenes were filmed in Glod, Romania. The "Kazakhstan" depicted in the movie bears no resemblance to the real country.'
            },
            {
                question: 'How did it affect Kazakh people?',
                answer: 'Initially, there was outrage and the government considered lawsuits. Many locals felt offended by the primitive portrayal. However, over time, some have embraced the attention, leading to the "Very Nice!" tourism campaign.'
            },
            {
                question: 'Is the character real?',
                answer: 'No, Borat Sagdiyev is a satirical character created by Sacha Baron Cohen. He is not a real journalist.'
            }
        ]
    }
};

async function seedBoratData() {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) {
        console.error('CRITICAL: No service account found.');
        return;
    }

    const app = initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore(app);

    console.log('--- Seeding Borat Page Data ---');

    try {
        // 1. Create Author
        console.log(`Setting author: ${AUTHOR_ID}...`);
        await db.collection('authors').doc(AUTHOR_ID).set(DATA.author, { merge: true });

        // 2. Create Page Document
        console.log(`Setting page: ${PAGE_ID}...`);
        const pageRef = db.collection('pages').doc(PAGE_ID);
        await pageRef.set(DATA.page, { merge: true });

        // 3. Subcollection: Articles
        console.log('Setting articles...');
        const articlesCollection = pageRef.collection('articles');
        for (const article of DATA.articles) {
            await articlesCollection.doc(article.id).set(article);
        }

        // 4. Subcollection: Key Facts
        console.log('Setting key facts...');
        const keyFactsCollection = pageRef.collection('keyFacts');
        // Delete existing to avoid dupes/ordering issues if re-running
        const existingFacts = await keyFactsCollection.get();
        const batch = db.batch();
        existingFacts.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        for (const fact of DATA.keyFacts) {
            // Use auto-ID for key facts usually, or deterministic if desired. Let's use auto-ID.
            await keyFactsCollection.add(fact);
        }

        // 5. Subcollection: Video
        console.log('Setting video...');
        await pageRef.collection('video').doc('main').set(DATA.video);

        // 6. Subcollection: Map
        console.log('Setting map...');
        // Convert to GeoPoint if needed? The frontend loader handles plain objects too, but let's be cleaner.
        // Actually the loader checks for 'latitude' and 'longitude' properties in serializeDates.
        // So plain object is fine as long as we store it right.
        await pageRef.collection('map').doc('main').set(DATA.map);

        // 7. Subcollection: Photo Gallery
        console.log('Setting photo gallery...');
        await pageRef.collection('photoGallery').doc('main').set(DATA.photoGallery);

        // 8. Subcollection: FAQ
        console.log('Setting FAQ...');
        await pageRef.collection('faq').doc('main').set(DATA.faq);

        console.log('--- Seed Complete! ---');

    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

seedBoratData();
