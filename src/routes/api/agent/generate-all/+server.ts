
import { json } from '@sveltejs/kit';
import { destinationPrompts } from '$lib/server/destinationPrompts';
import { generateDestinationPage } from '$lib/server/agentPageGenerator';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
    const results = [];

    // 1. GENERATE PAGES
    for (const prompt of destinationPrompts) {
        try {
            const res = await generateDestinationPage(prompt);
            results.push({ slug: prompt.slug, status: 'success', path: res.path });
        } catch (e: any) {
            console.error(`Error generating ${prompt.slug}:`, e);
            results.push({ slug: prompt.slug, status: 'error', error: e.message });
        }
    }

    // 2. AUTO-UPDATE KNOWN_DESTINATION_PATHS
    try {
        const pageServerPath = path.resolve('src/routes/destinations/[slug]/+page.server.ts');
        let content = fs.readFileSync(pageServerPath, 'utf-8');

        let addedCount = 0;
        const insertMarker = '// Add others here as they are generated';

        for (const prompt of destinationPrompts) {
            // Check if key exists
            if (!content.includes(`'${prompt.slug}':`)) {
                const newLine = `        '${prompt.slug}': '${prompt.targetPath}',\n`;
                content = content.replace(insertMarker, `${newLine}        ${insertMarker}`);
                addedCount++;
                console.log(`[Agent] Injected ${prompt.slug} into KNOWN_DESTINATION_PATHS`);
            }
        }

        if (addedCount > 0) {
            fs.writeFileSync(pageServerPath, content, 'utf-8');
        }

    } catch (err) {
        console.error("[Agent] Failed to auto-update +page.server.ts:", err);
    }

    return json({
        message: "Agent generation complete",
        results
    });
}
