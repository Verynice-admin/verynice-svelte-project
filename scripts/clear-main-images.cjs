const admin = require('firebase-admin');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const BACKUP_ROOT = path.join(__dirname, '..', 'backups', 'Verynice_stock_photos');

async function clearMainImages() {
    console.log('🚀 Starting Main Image Cleanup for all attractions...');

    let serviceAccount;
    const saVar = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.VITE_FIREBASE_SERVICE_ACCOUNT;

    try {
        if (saVar) {
            if (saVar.startsWith('{')) serviceAccount = JSON.parse(saVar);
            else if (fs.existsSync(path.resolve(saVar))) serviceAccount = JSON.parse(fs.readFileSync(path.resolve(saVar), 'utf8'));
        }
        if (!serviceAccount) {
            const commonPaths = [path.resolve('.secrets/serviceAccountKey.json'), path.resolve('serviceAccountKey.json')];
            for (const p of commonPaths) if (fs.existsSync(p)) { serviceAccount = JSON.parse(fs.readFileSync(p, 'utf8')); break; }
        }
        if (!serviceAccount) throw new Error('No service account found.');
        if (serviceAccount.private_key?.includes('\\n')) serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

        if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        const db = admin.firestore();

        // 1. Process all attractions in all regions
        const articlesSnap = await db.collection('pages').doc('destinationsPage').collection('articles').get();
        let attractionCount = 0;

        for (const articleDoc of articlesSnap.docs) {
            const attractionsSnap = await articleDoc.ref.collection('attractions').get();

            for (const attractionDoc of attractionsSnap.docs) {
                attractionCount++;
                const attrSlug = attractionDoc.id;
                const regionName = (articleDoc.data().title || articleDoc.id).replace(/[^a-z0-9&]/gi, '_');

                console.log(`🖼️ Clearing main images for: ${attrSlug}...`);

                const fieldsToClear = {
                    'image.publicId': admin.firestore.FieldValue.delete(),
                    'image.url': admin.firestore.FieldValue.delete(),
                    'heroImagePublicId': admin.firestore.FieldValue.delete(),
                    'headerBackgroundPublicId': admin.firestore.FieldValue.delete(),
                    'mainImage': admin.firestore.FieldValue.delete(),
                    'heroImage': admin.firestore.FieldValue.delete()
                };

                // Also clear the 'image' object if it contains a URL/PublicId
                await attractionDoc.ref.update(fieldsToClear);

                // 2. Update Local Backup if it exists
                const localPath = path.join(BACKUP_ROOT, regionName, attrSlug, 'data.json');
                if (fs.existsSync(localPath)) {
                    try {
                        const fileData = JSON.parse(fs.readFileSync(localPath, 'utf8'));
                        if (fileData.main) {
                            delete fileData.main.heroImagePublicId;
                            delete fileData.main.headerBackgroundPublicId;
                            delete fileData.main.mainImage;
                            delete fileData.main.heroImage;
                            if (fileData.main.image) {
                                delete fileData.main.image.publicId;
                                delete fileData.main.image.url;
                                // If image object is empty now, maybe delete it or leave it as {}
                            }
                            fs.writeFileSync(localPath, JSON.stringify(fileData, null, 2));
                        }
                    } catch (e) {
                        console.error(`   ⚠️ Failed to update local backup at ${localPath}: ${e.message}`);
                    }
                }
            }
        }

        console.log(`\n✅ MAIN IMAGE CLEANUP COMPLETE!`);
        console.log(`Processed ${attractionCount} attractions.`);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
    }
}

clearMainImages();
