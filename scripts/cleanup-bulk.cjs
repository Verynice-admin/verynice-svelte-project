const admin = require('firebase-admin');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const titlesToRemove = [
    "Alley Of Glory War Memorial",
    "Central Park Shymkent",
    "Citadel Of Shymkent",
    "Independence Park Shymkent",
    "Ken Baba Park",
    "Abu Nasyr Al Farabi Mosque Shymkent",
    "Arbat Walking Street",
    "Imangali Mosque",
    "Khakim Abay Museum",
    "Koshkar Ata Riverwalk",
    "Museum Of Fine Arts Shymkent",
    "Museum Victims Political Repressions",
    "Sayram Historical Sites",
    "Shymkent Shymkent Arbat",
    "Shymkent Old Town",
    "Shymkent Zoo",
    "South Kazakhstan",
    "South Kazakhstan Regional Museum",
    "Ulugh Beg Observatory",
    "Kumkent",
    "Aulie Holy Caves"
];

const BACKUP_ROOT = path.join(__dirname, '..', 'backups', 'Verynice_stock_photos');

async function runCleanup() {
    console.log('🚀 Starting Massive Cleanup...');

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

        const articlesSnap = await db.collection('pages').doc('destinationsPage').collection('articles').get();

        for (const articleDoc of articlesSnap.docs) {
            const attractionsSnap = await articleDoc.ref.collection('attractions').get();

            for (const attractionDoc of attractionsSnap.docs) {
                const data = attractionDoc.data();
                const title = data.title || '';
                const slug = attractionDoc.id;

                if (titlesToRemove.some(t => t.toLowerCase() === title.toLowerCase()) ||
                    titlesToRemove.some(t => t.toLowerCase().replace(/ /g, '-') === slug.toLowerCase())) {

                    console.log(`\n🗑️ Deleting: ${title} (${slug}) from region: ${articleDoc.id}`);

                    // 1. Delete Firestore Subcollections
                    const subcollections = ['articles', 'keyFacts', 'video', 'map', 'faq', 'photoGallery', 'relatedPosts'];
                    for (const sub of subcollections) {
                        const subSnap = await attractionDoc.ref.collection(sub).get();
                        if (!subSnap.empty) {
                            const batch = db.batch();
                            subSnap.docs.forEach(d => batch.delete(d.ref));
                            await batch.commit();
                        }
                    }

                    // 2. Delete main Firestore doc
                    await attractionDoc.ref.delete();

                    // 3. Delete Local Backup Folder
                    const regionName = (articleDoc.data().title || articleDoc.id).replace(/[^a-z0-9&]/gi, '_');
                    const localPath = path.join(BACKUP_ROOT, regionName, slug);
                    if (fs.existsSync(localPath)) {
                        console.log(`   📂 Removing local backup: ${localPath}`);
                        fs.rmSync(localPath, { recursive: true, force: true });
                    }
                }
            }
        }

        console.log('\n✅ CLEANUP COMPLETE!');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
    }
}

runCleanup();
