const admin = require('firebase-admin');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function deleteAttraction() {
    console.log('🚀 Starting Deletion of Central Mosque...');

    // Attempt to find service account like the backup script does
    let serviceAccount;
    const saVar = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.VITE_FIREBASE_SERVICE_ACCOUNT;

    try {
        if (saVar) {
            if (saVar.startsWith('{')) {
                serviceAccount = JSON.parse(saVar);
            } else {
                const saPath = path.resolve(saVar);
                if (fs.existsSync(saPath)) {
                    serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
                }
            }
        }

        if (!serviceAccount) {
            const commonPaths = [
                path.resolve('.secrets/serviceAccountKey.json'),
                path.resolve('serviceAccountKey.json'),
                process.env.GOOGLE_APPLICATION_CREDENTIALS ? path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS) : null
            ].filter(Boolean);

            for (const p of commonPaths) {
                if (fs.existsSync(p)) {
                    serviceAccount = JSON.parse(fs.readFileSync(p, 'utf8'));
                    break;
                }
            }
        }

        if (!serviceAccount) {
            throw new Error('No service account found.');
        }

        if (serviceAccount.private_key && serviceAccount.private_key.includes('\\n')) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }

        const db = admin.firestore();
        const TARGET_SLUG = 'central-mosque';
        let found = false;

        console.log(`🔍 Searching for attraction: ${TARGET_SLUG}...`);

        const articlesSnap = await db.collection('pages').doc('destinationsPage').collection('articles').get();

        for (const articleDoc of articlesSnap.docs) {
            const attractionRef = articleDoc.ref.collection('attractions').doc(TARGET_SLUG);
            const doc = await attractionRef.get();

            if (doc.exists) {
                console.log(`✅ Found in region: ${articleDoc.id}`);

                const subcollections = ['articles', 'keyFacts', 'video', 'map', 'faq', 'photoGallery', 'relatedPosts'];
                for (const sub of subcollections) {
                    const subSnap = await attractionRef.collection(sub).get();
                    if (!subSnap.empty) {
                        console.log(`   🗑️ Deleting ${subSnap.size} docs in subcollection: ${sub}`);
                        const batch = db.batch();
                        subSnap.docs.forEach(d => batch.delete(d.ref));
                        await batch.commit();
                    }
                }

                await attractionRef.delete();
                console.log(`🚀 SUCCESSFULLY DELETED: ${TARGET_SLUG}`);
                found = true;
                break;
            }
        }

        if (!found) {
            console.log(`❌ Attraction '${TARGET_SLUG}' not found.`);
        }

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
    }
}

deleteAttraction();
