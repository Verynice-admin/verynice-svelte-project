import { json } from '@sveltejs/kit';
import { seedCharynCanyon } from '$lib/server/seedCharynCanyon';
import { requireAdminAccess } from '$lib/server/apiAuth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, url }) => {
    const auth = requireAdminAccess(request, url);
    if (!auth.ok) return auth.response;

    try {
        await seedCharynCanyon();
        return json({ success: true, message: "Charyn Canyon seeded successfully" });
    } catch (err) {
        console.error("Seeding failed:", err);
        return json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
};
