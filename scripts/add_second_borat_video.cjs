
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

function loadServiceAccount() {
    const secretsPaths = [
        path.resolve('.secrets/serviceAccountKey.json'),
        path.resolve('.secrets/service-account.json')
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

async function addSecondBoratVideo() {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) {
        console.error('CRITICAL: No service account found.');
        return;
    }

    const app = initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore(app);

    console.log('--- Adding Second Borat Page Video ---');

    try {
        const videoRef = db.collection('pages').doc('boratPage').collection('video').doc('tourism_campaign');

        // Adding the second video as a separate document in the collection
        // Since the current loader only fetches one video (based on how it's written in +page.server.ts),
        // we might strictly need to update the logic to support multiple videos first.
        // HOWEVER, based on standard "embed this video" request, I will replace the main video 
        // OR add it if the user intended a gallery. Given the singular "video" component structure currently visible,
        // it's safest to ask or check if we can support multiple. 
        // BUT the user said "embed second video", implying addition. 
        // Let's verify if the UI supports multiple videos.

        // Actually, looking at history/+page.svelte:
        // {#if pageData.video?.url}
        // 		<VideoEmbed title={pageData.video.title || 'Video'} url={pageData.video.url} />
        // {/if}
        // It only supports ONE video object named 'video'.

        // If I want to show a SECOND video, I need to modify the data structure to be an ARRAY of videos
        // or add a second video component.

        // Strategy: 
        // 1. Update the 'video' subcollection to contain this new video.
        // 2. We need to update the code to load ALL videos from the collection, not just the first one.

        await videoRef.set({
            title: 'Kazakh Tourism: Very Nice!',
            url: 'https://youtu.be/eRGXq4t9wY4?si=Ty7Xh3foVEKvyB7p',
            order: 2
        });

        console.log('Added second video to subcollection.');

    } catch (error) {
        console.error('Error adding video:', error);
    }
}

addSecondBoratVideo();
