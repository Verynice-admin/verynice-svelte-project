
export interface DestinationPrompt {
    slug: string;
    targetPath: string;
    data: {
        title: string;
        authorId: string;
        articles: { title: string; contentMarkdown: string, type: 'article', order: number }[];
        keyFacts: { label: string; value: string; icon: string, order: number }[];
        faqs: { question: string; answer: string }[];
        map: { lat: number; lng: number; zoom: number; title: string };
        video: { url: string; title: string; provider: string };
        imageFallback: string;
        mainTitle?: string;
        headerDescription?: string;
        shortDescription?: string;
        location?: { name: string; type: string };
        tier: number;
        seo?: { title: string; description: string };
        description?: string;
    };
    deletePath?: string;
}

export const destinationPrompts: DestinationPrompt[] = [
    {
        slug: 'zhumabayev-park',
        targetPath: 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/zhumabayev-park',
        data: {
            title: "Zhumabayev Park",
            mainTitle: "Zhumabayev Park: Poet's Corner",
            authorId: "aliya-askar",
            tier: 3,
            headerDescription: "A quiet, leafy park in the south-east of the city, dedicated to the repressed Kazakh poet Magjan Zhumabayev.",
            shortDescription: "City park named after a prominent Kazakh poet.",
            location: { name: "Astana", type: "Park" },
            seo: { title: "Zhumabayev Park Guide", description: "Walking in Zhumabayev Park. Monuments and history." },
            video: { url: "", title: "", provider: "youtube" },
            imageFallback: "https://upload.wikimedia.org/wikipedia/commons/2/23/Green_Bazaar_Almaty.jpg", // Generic green park
            articles: [
                {
                    title: "A Tribute to Poetry",
                    type: 'article',
                    order: 1,
                    contentMarkdown: `
Named after **Magjan Zhumabayev**, one of the leaders of the Alash Orda movement who was executed during the Stalinist purges. The park features a statue of the poet. It is a favorite spot for students from the nearby Eurasia University to study and relax.
`
                }
            ],
            keyFacts: [
                { label: "Poet", value: "Magjan", icon: "book", order: 1 },
                { label: "Vibe", value: "Quiet", icon: "coffee", order: 2 }
            ],
            faqs: [],
            map: { lat: 51.1500, lng: 71.4800, zoom: 15, title: "Zhumabayev Park" }
        }
    },
    {
        slug: 'lovers-park',
        targetPath: 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/lovers-park',
        data: {
            title: "Lovers Park",
            mainTitle: "Lovers Park: Romance in the City",
            authorId: "aliya-askar",
            tier: 2,
            headerDescription: "A romantic, lush public park facing the Khan Shatyr. Its layout is heart-shaped (if seen from above) and features quaint benches and sculptures.",
            shortDescription: "Green park popular for strolls and photos.",
            location: { name: "Astana", type: "Park" },
            seo: { title: "Lovers Park Astana", description: "A romantic spot in the center of Astana perfectly facing the Khan Shatyr." },
            video: { url: "", title: "", provider: "youtube" },
            imageFallback: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Baiterek_tower_Astana.jpg", // Changed fallback to Baiterek/City as it is more reliable
            articles: [
                {
                    title: "A Photo Spot",
                    type: 'article',
                    order: 1,
                    contentMarkdown: `
Also known as "Park of Lovers," this green space sits directly opposite the Khan Shatyr. It is famous for the "I Love Astana" sign, which is the obligatory photo spot for every tourist.
`
                }
            ],
            keyFacts: [
                { label: "Shape", value: "Heart", icon: "heart", order: 1 },
                { label: "Access", value: "Free", icon: "tag", order: 2 }
            ],
            faqs: [],
            map: { lat: 51.1340, lng: 71.4080, zoom: 15, title: "Lovers Park" }
        }
    }
];
