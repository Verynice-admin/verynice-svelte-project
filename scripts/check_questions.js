
import { adminDB } from '../src/lib/server/firebaseAdmin.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkQuestions() {
    console.log('Checking for user questions in Firestore...');
    try {
        const snapshot = await adminDB
            .collection('pages')
            .doc('historyPage')
            .collection('user_questions')
            .get();

        if (snapshot.empty) {
            console.log('No questions found in pages/historyPage/user_questions.');
        } else {
            console.log(`Found ${snapshot.size} questions:`);
            snapshot.forEach(doc => {
                console.log(`[${doc.id}] ${JSON.stringify(doc.data())}`);
            });
        }
    } catch (error) {
        console.error('Error checking questions:', error);
    }
}

checkQuestions();
