import { json } from '@sveltejs/kit';
import { destinationPrompts } from '$lib/server/destinationPrompts';
import { generateDestinationPage } from '$lib/server/agentPageGenerator';
import { requireAdminAccess } from '$lib/server/apiAuth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, url }) => {
    const auth = requireAdminAccess(request, url);
    if (!auth.ok) return auth.response;

    const results = [];

    for (const prompt of destinationPrompts) {
        try {
            const res = await generateDestinationPage(prompt);
            results.push({ slug: prompt.slug, status: 'success', path: res.path });
        } catch (e: any) {
            console.error(`Error generating ${prompt.slug}:`, e);
            results.push({ slug: prompt.slug, status: 'error', error: e.message });
        }
    }

    // New slugs are reported in the response — add them to KNOWN_DESTINATION_PATHS manually
    // (runtime source-file mutation via fs.writeFileSync is not safe in serverless environments)
    const newSlugs = results.filter(r => r.status === 'success').map(r => r.slug);

    return json({
        message: "Agent generation complete",
        results,
        note: newSlugs.length > 0
            ? `Add these slugs to KNOWN_DESTINATION_PATHS in +page.server.ts: ${newSlugs.join(', ')}`
            : undefined
    });
};
