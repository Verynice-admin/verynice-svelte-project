import { json } from '@sveltejs/kit';
import { adminDB } from '$lib/server/firebaseAdmin';

function slugify(s: string) {
    return String(s)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export async function GET() {
    if (!adminDB) return json({ error: 'No Admin DB' });

    const regions = [
        'Almaty & Nearby',
        'Astana & Nearby',
        'Turkistan & Shymkent',
        'Mangystau Region',
        'East Kazakhstan',
        'Central Kazakhstan',
        'Northern Kazakhstan'
    ];

    const batch = adminDB.batch();
    const articlesRef = adminDB.collection('pages').doc('attractionsPage').collection('articles');

    let order = 10;
    const results: any[] = [];

    for (const region of regions) {
        const slug = slugify(region);
        const articleId = `section-${slug}`;
        const docRef = articlesRef.doc(articleId);

        const data = {
            title: region,
            articleId: articleId, // Matches DOM ID in page
            order: order,
            type: 'region_section',
            contentHTML: '',
            year: '' // Added for compatibility with AsideToc if it expects timeline data
        };

        batch.set(docRef, data, { merge: true });
        results.push({ id: articleId, data });
        order += 10;
    }

    try {
        await batch.commit();
        return json({ success: true, count: results.length, results });
    } catch (e: any) {
        return json({ error: e.message });
    }
}
