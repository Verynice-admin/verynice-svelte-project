
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

function loadServiceAccount() {
    const secretsPaths = [
        path.resolve('.secrets/serviceAccountKey.json'),
        path.resolve('.secrets/service-account.json'),
        path.resolve('serviceAccountKey.json')
    ];

    for (const secretsPath of secretsPaths) {
        try {
            if (fs.existsSync(secretsPath)) {
                console.log(`Found service account at: ${secretsPath}`);
                return require(secretsPath);
            }
        } catch (error) {
            console.error('Error reading service account:', error);
        }
    }
    return null;
}

async function checkQuestions() {
    console.log('--- Verifying Question Submission ---');

    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) {
        console.error('CRITICAL: No service account found. Cannot verify database.');
        return;
    }

    try {
        const app = initializeApp({
            credential: cert(serviceAccount)
        });
        const db = getFirestore(app);

        console.log('Connected to Firestore. Querying pages/historyPage/user_questions...');
        const snapshot = await db
            .collection('pages')
            .doc('historyPage')
            .collection('user_questions')
            .orderBy('createdAt', 'desc')
            .get();

        if (snapshot.empty) {
            console.log('RESULT: No documents found in user_questions collection.');
        } else {
            console.log(`RESULT: Found ${snapshot.size} questions!`);
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log(`\n[ID: ${doc.id}]`);
                console.log(`Question: "${data.question}"`);
                console.log(`Status: ${data.status}`);
                console.log(`Created: ${data.createdAt ? data.createdAt.toDate() : 'N/A'}`);
            });
        }
    } catch (error) {
        console.error('Error during verification:', error);
    }
}

checkQuestions();
