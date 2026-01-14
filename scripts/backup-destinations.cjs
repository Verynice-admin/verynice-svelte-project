const admin = require('firebase-admin');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function runBackup() {
    console.log('🚀 Starting Full Firestore Backup...');

    // Attempt to find service account like the app does
    let serviceAccount;
    const saVar = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.VITE_FIREBASE_SERVICE_ACCOUNT;

    try {
        if (saVar) {
            if (saVar.startsWith('{')) {
                serviceAccount = JSON.parse(saVar);
                console.log('✅ Found service account in environment variable.');
            } else {
                // If it's a path
                const saPath = path.resolve(saVar);
                if (fs.existsSync(saPath)) {
                    serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
                    console.log(`✅ Found service account at path: ${saPath}`);
                }
            }
        }

        // Fallback to searching common paths if not found
        if (!serviceAccount) {
            const commonPaths = [
                path.resolve('.secrets/serviceAccountKey.json'),
                path.resolve('serviceAccountKey.json'),
                process.env.GOOGLE_APPLICATION_CREDENTIALS ? path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS) : null
            ].filter(Boolean);

            for (const p of commonPaths) {
                if (fs.existsSync(p)) {
                    serviceAccount = JSON.parse(fs.readFileSync(p, 'utf8'));
                    console.log(`✅ Found service account at common path: ${p}`);
                    break;
                }
            }
        }

        if (!serviceAccount) {
            throw new Error('No service account found in environment or common paths.');
        }

        // Critical: Handle private key newlines
        if (serviceAccount.private_key && serviceAccount.private_key.includes('\\n')) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }

        const db = admin.firestore();
        const BACKUP_ROOT = path.join(__dirname, '..', 'backups', 'Verynice_stock_photos');

        async function backupSubcollection(docRef, subName) {
            const snap = await docRef.collection(subName).get();
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }

        if (!fs.existsSync(BACKUP_ROOT)) {
            fs.mkdirSync(BACKUP_ROOT, { recursive: true });
        }

        const articlesSnap = await db.collection('pages').doc('destinationsPage').collection('articles').get();

        for (const articleDoc of articlesSnap.docs) {
            const regionData = articleDoc.data();
            const regionName = (regionData.title || articleDoc.id).replace(/[^a-z0-9&]/gi, '_');
            const regionPath = path.join(BACKUP_ROOT, regionName);

            console.log(`\n📂 Backing up Region: ${regionName}`);
            if (!fs.existsSync(regionPath)) fs.mkdirSync(regionPath, { recursive: true });

            const attractionsSnap = await articleDoc.ref.collection('attractions').get();

            for (const attractionDoc of attractionsSnap.docs) {
                const attrData = attractionDoc.data();
                const attrSlug = attractionDoc.id;
                const attrPath = path.join(regionPath, attrSlug);

                console.log(`  📄 Attraction: ${attrSlug}`);
                if (!fs.existsSync(attrPath)) fs.mkdirSync(attrPath, { recursive: true });

                const [articles, keyFacts, video, map, faq, gallery, related] = await Promise.all([
                    backupSubcollection(attractionDoc.ref, 'articles'),
                    backupSubcollection(attractionDoc.ref, 'keyFacts'),
                    backupSubcollection(attractionDoc.ref, 'video'),
                    backupSubcollection(attractionDoc.ref, 'map'),
                    backupSubcollection(attractionDoc.ref, 'faq'),
                    backupSubcollection(attractionDoc.ref, 'photoGallery'),
                    backupSubcollection(attractionDoc.ref, 'relatedPosts')
                ]);

                const fullBackup = {
                    main: attrData,
                    subcollections: {
                        articles,
                        keyFacts,
                        video,
                        map,
                        faq,
                        photoGallery: gallery,
                        relatedPosts: related
                    },
                    backupTimestamp: new Date().toISOString()
                };

                fs.writeFileSync(
                    path.join(attrPath, 'data.json'),
                    JSON.stringify(fullBackup, null, 2)
                );
            }
        }

        console.log('\n✅ BACKUP COMPLETE!');
        console.log(`Location: ${BACKUP_ROOT}`);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

runBackup();
