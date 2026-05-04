import { json } from '@sveltejs/kit';
import { createBigAlmatyLakePage } from '$lib/server/seedBigAlmatyLake';
import { requireAdminAccess } from '$lib/server/apiAuth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, url }) => {
    const auth = requireAdminAccess(request, url);
    if (!auth.ok) return auth.response;

    try {
        await createBigAlmatyLakePage();
        return json({ success: true, message: 'Big Almaty Lake seeded successfully' });
    } catch (error) {
        console.error('Seeding error:', error);
        return json({ success: false, error: 'Failed to seed' }, { status: 500 });
    }
};
