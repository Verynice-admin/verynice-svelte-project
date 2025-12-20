
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

async function fixExistingQuestions() {
    console.log('--- Fixing Existing Questions ---');

    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) return;

    try {
        const app = initializeApp({ credential: cert(serviceAccount) });
        const db = getFirestore(app);
        const collectionRef = db.collection('pages').doc('historyPage').collection('user_questions');

        const snapshot = await collectionRef.get();

        if (snapshot.empty) {
            console.log('No questions found to fix.');
            return;
        }

        let fixedCount = 0;
        const batch = db.batch();

        snapshot.forEach(doc => {
            const data = doc.data();
            // If answer field is missing, add it
            if (data.answer === undefined || data.answer === null) {
                console.log(`Fixing doc: ${doc.id}`);
                batch.update(doc.ref, {
                    answer: 'TYPE ANSWER HERE (Then refresh website)'
                });
                fixedCount++;
            }
        });

        if (fixedCount > 0) {
            await batch.commit();
            console.log(`Successfully fixed ${fixedCount} questions!`);
        } else {
            console.log('All questions already have an answer field.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

fixExistingQuestions();
