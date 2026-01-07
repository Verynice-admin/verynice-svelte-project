import { json } from '@sveltejs/kit';
import { createBigAlmatyLakePage } from '$lib/server/seedBigAlmatyLake';

export async function GET() {
    try {
        await createBigAlmatyLakePage();
        return json({ success: true, message: 'Big Almaty Lake seeded successfully' });
    } catch (error) {
        console.error('Seeding error:', error);
        return json({ success: false, error: 'Failed to seed' }, { status: 500 });
    }
}
