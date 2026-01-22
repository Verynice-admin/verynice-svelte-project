const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initFirebase() {
    if (admin.apps.length) return admin.firestore();
    const saVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    let sa;
    if (saVar) sa = JSON.parse(saVar);
    else if (fs.existsSync(path.resolve('.secrets/serviceAccountKey.json'))) {
        sa = JSON.parse(fs.readFileSync(path.resolve('.secrets/serviceAccountKey.json'), 'utf8'));
    } else {
        console.warn('No service account found in standard locations.');
        try {
            admin.initializeApp();
            return admin.firestore();
        } catch (e) {
            throw new Error('Could not initialize Firebase Admin.');
        }
    }
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    return admin.firestore();
}

async function main() {
    const db = await initFirebase();
    const pageRef = db.collection('pages').doc('boratPage');

    console.log('Checking pages/boratPage...');
    const doc = await pageRef.get();

    if (!doc.exists) {
        console.error('Document pages/boratPage does not exist!');
        return;
    }

    const data = doc.data();
    console.log('Current Page Data:', {
        headerBackgroundPublicId: data.headerBackgroundPublicId,
        authorId: data.authorId
    });

    if (data.authorId) {
        const authorRef = db.collection('authors').doc(data.authorId);
        const authorDoc = await authorRef.get();
        if (authorDoc.exists) {
            console.log('Author Data:', authorDoc.data());

            // Update author image
            const correctId = 'content/pages/aboutBorat/borat_author';
            console.log(`Updating author profilePicturePublicId to: ${correctId}`);
            await authorRef.update({
                profilePicturePublicId: correctId
            });
            console.log('Author updated successfully');
        } else {
            console.warn(`Author doc ${data.authorId} referenced but does not exist.`);
        }
    } else {
        console.warn('No authorId on this page. Creating/Searching author...');

        // Search for Borat author
        const authorsSnap = await db.collection('authors').where('name', '==', 'Borat Sagdiyev').get();
        let authorId;

        if (!authorsSnap.empty) {
            authorId = authorsSnap.docs[0].id;
            console.log('Found existing Borat author:', authorId);
            await db.collection('authors').doc(authorId).update({
                profilePicturePublicId: 'content/pages/aboutBorat/borat_author'
            });
        } else {
            console.log('Creating new Borat author...');
            const newAuthor = await db.collection('authors').add({
                name: 'Borat Sagdiyev',
                title: 'Lead Country Promoter',
                bio: 'Providing accurate facts about our glorious nation.',
                profilePicturePublicId: 'content/pages/aboutBorat/borat_author',
                createdAt: new Date().toISOString()
            });
            authorId = newAuthor.id;
        }

        console.log(`Linking author ${authorId} to page...`);
        await pageRef.update({ authorId: authorId });
        console.log('Page updated with authorId');
    }
}

main().catch(console.error);
