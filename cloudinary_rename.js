// cloudinary_rename.js
import { v2 as cloudinary } from 'cloudinary';
import { readFileSync } from 'fs';
import 'dotenv/config'; // Loads variables from .env file

// --- SETUP AND CONFIGURATION ---

// Configure Cloudinary with your credentials from the .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Load the migration plan you generated
const mapping = JSON.parse(readFileSync('./migration-plan.json'));

// Check if we are in "dry run" mode (the default and safest option)
// To run for real, you must use the --live flag
const isDryRun = !process.argv.includes('--live');

// --- SCRIPT LOGIC ---

/**
 * Renames a single file in Cloudinary.
 * @param {string} oldId - The current public_id.
 * @param {string} newId - The desired new public_id.
 */
async function renameFile(oldId, newId) {
  try {
    // The overwrite: true option will replace a file if it already exists at the newId path.
    const result = await cloudinary.uploader.rename(oldId, newId, { overwrite: true });
    console.log(`   ✅ SUCCESS: Renamed to ${result.public_id}`);
    return true;
  } catch (error) {
    // This will catch errors, e.g., if the original file doesn't exist.
    console.error(`   ❌ FAILED: ${error.message}`);
    return false;
  }
}

/**
 * Main function to loop through the plan and execute renames.
 */
async function runRenamer() {
  if (isDryRun) {
    console.log('--- 💧 RUNNING IN DRY RUN MODE (NO CHANGES WILL BE MADE TO CLOUDINARY) 💧 ---');
    console.log('--- This will simulate the renaming process. ---');
    console.log('--- To run for real and change files, use: node cloudinary_rename.js --live ---\n');
  } else {
    console.log('--- 🔥 LIVE MODE - RENAMING FILES ON CLOUDINARY NOW 🔥 ---');
    console.log('--- This is a permanent action. --- \n');
  }
  
  let successCount = 0;
  let failureCount = 0;

  for (const item of mapping) {
    console.log(`\n▶️  ATTEMPTING:`);
    console.log(`    - FROM: "${item.oldId}"`);
    console.log(`    - TO:   "${item.newId}"`);

    if (!isDryRun) {
      // We add a small delay to avoid hitting API rate limits on large projects.
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay
      const success = await renameFile(item.oldId, item.newId);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
    } else {
      // In dry run, we just pretend it was a success.
      console.log('   (Dry Run - No action taken)');
      successCount++;
    }
  }

  console.log('\n--- Renamer Finished ---');
  if (isDryRun) {
    console.log(`✅ Dry run complete. ${successCount} renames were simulated.`);
  } else {
    console.log(`✅ Live run complete.`);
    console.log(`   - ${successCount} files successfully renamed.`);
    console.log(`   - ${failureCount} files failed.`);
  }
}

runRenamer();