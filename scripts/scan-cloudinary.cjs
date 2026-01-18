const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME || 'verynice',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function scan() {
    console.log('Scanning Cloudinary...');
    let resources = [];
    let next_cursor = null;

    do {
        const res = await cloudinary.api.resources({
            type: 'upload',
            max_results: 500,
            next_cursor: next_cursor
        });
        resources = [...resources, ...res.resources];
        next_cursor = res.next_cursor;
    } while (next_cursor && resources.length < 2000); // Limit to 2000 for now

    console.log(`Found ${resources.length} resources.`);

    const fs = require('fs');
    fs.writeFileSync('cloudinary_dump.json', JSON.stringify(resources, null, 2));

    // Find potential hero images (large, landscape)
    const heroes = resources.filter(r => r.width > 1600 && r.width > r.height).slice(0, 10);
    console.log('--- POTENTIAL HEROES ---');
    heroes.forEach(h => console.log(h.public_id, `(${h.width}x${h.height})`));

    // Find city images
    const cities = resources.filter(r => r.public_id.includes('Almaty') || r.public_id.includes('Astana')).slice(0, 5);
    console.log('--- CITIES ---');
    cities.forEach(c => console.log(c.public_id));
}

scan().catch(console.error);
