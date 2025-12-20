import { json } from '@sveltejs/kit';
import { adminDB } from '$lib/server/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import { generateAnswer } from '$lib/server/aiService';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    try {
        const { question } = await request.json();

        if (!question || typeof question !== 'string' || question.trim().length === 0) {
            return json({ error: 'Question is required' }, { status: 400 });
        }

        if (!adminDB) {
            console.error('Firebase Admin not initialized');
            return json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Create a meaningful ID: YYYY-MM-DD_HHmm_slug-of-question
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const timeStr = now.toISOString().slice(11, 16).replace(':', ''); // HHmm

        // Simple slugify: lowercase, remove special chars, replace spaces with hyphens, max 30 chars
        const slug = question
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .slice(0, 30);

        const docId = `${dateStr}_${timeStr}_${slug}`;

        // Save to the 'user_questions' subcollection with custom ID
        const docRef = adminDB
            .collection('pages')
            .doc('historyPage')
            .collection('user_questions')
            .doc(docId);

        // Generate answer using AI
        const aiResult = await generateAnswer(question);

        let answer = 'TYPE ANSWER HERE (Then refresh website)';
        let status = 'pending';
        let finalQuestion = question.trim();

        if (aiResult) {
            answer = aiResult.answer;
            finalQuestion = aiResult.correctedQuestion;
            status = 'answered';
        }

        await docRef.set({
            question: finalQuestion,
            answer: answer,
            status: status, // pending, answered, ignored
            createdAt: Timestamp.now(),
            source: 'history_page_faq',
            aiGenerated: !!aiResult
        });

        // FIFO Cleanup: Limit to 15 recent questions
        try {
            const questionsRef = adminDB
                .collection('pages')
                .doc('historyPage')
                .collection('user_questions');

            // Get all questions ordered by creation time (newest first)
            const snapshot = await questionsRef.orderBy('createdAt', 'desc').get();

            if (snapshot.size > 15) {
                const docsToDelete = snapshot.docs.slice(15);
                const batch = adminDB.batch();
                docsToDelete.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                console.log(`[Cleanup] Deleted ${docsToDelete.length} old questions.`);
            }
        } catch (cleanupError) {
            console.error('[Cleanup] Error removing old questions:', cleanupError);
            // Don't fail the request if cleanup fails
        }

        return json({
            success: true,
            id: docId,
            message: aiResult ? 'Question answered!' : 'Question submitted successfully',
            aiAnswer: aiResult ? aiResult.answer : null,
            correctedQuestion: aiResult ? aiResult.correctedQuestion : null
        });

    } catch (error) {
        console.error('Error submitting question:', error);
        return json({ error: 'Failed to submit question' }, { status: 500 });
    }
}
