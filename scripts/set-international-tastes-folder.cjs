const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'verynice',
  api_key: '795653376351388',
  api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

const PREFIX = 'content/pages/foodDrinks/internationalTastes';
const TARGET_FOLDER = 'content/pages/foodDrinks/internationalTastes';

async function listAllResources() {
  const resources = [];
  let nextCursor;

  do {
    const result = await cloudinary.search
      .expression(`public_id:${PREFIX}*`)
      .max_results(500)
      .next_cursor(nextCursor)
      .execute();

    resources.push(...(result.resources || []));
    nextCursor = result.next_cursor;
  } while (nextCursor);

  return resources;
}

async function run() {
  console.log(`Scanning for assets with prefix ${PREFIX}...`);
  const resources = await listAllResources();
  console.log(`Found ${resources.length} assets.`);

  let updated = 0;
  let failed = 0;

  for (const resource of resources) {
    try {
      await cloudinary.api.update(resource.public_id, {
        asset_folder: TARGET_FOLDER
      });
      updated++;
    } catch (err) {
      console.error(`Failed to update ${resource.public_id}:`, err.message || err);
      failed++;
    }
  }

  console.log(`Done. Updated: ${updated}, Failed: ${failed}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
