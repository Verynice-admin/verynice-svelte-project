const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'backups', 'Verynice_stock_photos');

function toKebab(str) {
    return str
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function renameFolders() {
    if (!fs.existsSync(ROOT)) {
        console.error('❌ Root directory not found in project backups.');
        return;
    }

    const regions = fs.readdirSync(ROOT);

    for (const region of regions) {
        const oldRegionPath = path.join(ROOT, region);
        if (!fs.lstatSync(oldRegionPath).isDirectory()) continue;

        const newRegionName = toKebab(region);
        const newRegionPath = path.join(ROOT, newRegionName);

        if (oldRegionPath !== newRegionPath) {
            console.log(`📁 Renaming region: ${region} -> ${newRegionName}`);
            // Handle merge if exists (unlikely here)
            if (fs.existsSync(newRegionPath)) {
                // Move contents instead
                const attractions = fs.readdirSync(oldRegionPath);
                for (const attr of attractions) {
                    const oldAttrPath = path.join(oldRegionPath, attr);
                    const newAttrPath = path.join(newRegionPath, attr);
                    fs.renameSync(oldAttrPath, newAttrPath);
                }
                fs.rmdirSync(oldRegionPath);
            } else {
                fs.renameSync(oldRegionPath, newRegionPath);
            }
        }

        // Now process attractions inside
        const attractions = fs.readdirSync(newRegionPath);
        for (const attr of attractions) {
            const oldAttrPath = path.join(newRegionPath, attr);
            if (!fs.lstatSync(oldAttrPath).isDirectory()) continue;

            const newAttrName = toKebab(attr);
            const newAttrPath = path.join(newRegionPath, newAttrName);

            if (oldAttrPath !== newAttrPath) {
                console.log(`   📍 Renaming: ${attr} -> ${newAttrName}`);
                fs.renameSync(oldAttrPath, newAttrPath);
            }
        }
    }

    console.log('\n✅ FOLDER RENAMING COMPLETE!');
}

renameFolders();
