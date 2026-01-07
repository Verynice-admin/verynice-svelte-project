import { json } from '@sveltejs/kit';
import { seedCharynCanyon } from '$lib/server/seedCharynCanyon';

export async function GET() {
    try {
        await seedCharynCanyon();
        return json({ success: true, message: "Charyn Canyon seeded successfully" });
    } catch (err) {
        console.error("Seeding failed:", err);
        return json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
}
