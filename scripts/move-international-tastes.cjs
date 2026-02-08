const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'verynice',
  api_key: '795653376351388',
  api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

const SOURCE_PREFIX = 'content/pages/foodDrinks/internationalTastes/golden_braslet';
const TARGET_PREFIX = 'content/pages/foodDrinks/internationalTastes';

async function listAllResources(prefix) {
  const resources = [];
  let nextCursor = undefined;

  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix,
      max_results: 500,
      next_cursor: nextCursor
    });

    resources.push(...(result.resources || []));
    nextCursor = result.next_cursor;
  } while (nextCursor);

  return resources;
}

async function moveResources() {
  console.log(`Listing resources under ${SOURCE_PREFIX}...`);
  const resources = await listAllResources(SOURCE_PREFIX);
  console.log(`Found ${resources.length} resources.`);

  let moved = 0;
  let skipped = 0;
  let failed = 0;

  for (const resource of resources) {
    const publicId = resource.public_id;
    if (!publicId.startsWith(`${SOURCE_PREFIX}/`)) {
      skipped++;
      continue;
    }

    const suffix = publicId.slice(SOURCE_PREFIX.length + 1);
    const targetId = `${TARGET_PREFIX}/${suffix}`;

    try {
      console.log(`Renaming ${publicId} -> ${targetId}`);
      await cloudinary.uploader.rename(publicId, targetId, {
        overwrite: true
      });
      moved++;
    } catch (err) {
      console.error(`Failed to move ${publicId}:`, err.message || err);
      failed++;
    }
  }

  console.log(`\nDone. Moved: ${moved}, Skipped: ${skipped}, Failed: ${failed}`);
}

moveResources().catch((err) => {
  console.error('Move failed:', err);
  process.exit(1);
});
