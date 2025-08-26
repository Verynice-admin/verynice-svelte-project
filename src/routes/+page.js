// In src/routes/+page.js

import { db } from '$lib/services/firebase';
import { getDoc, doc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { error } from '@sveltejs/kit';

export const load = async () => {
  try {
    // 1. Fetch the main homepage content (hero title, etc.)
    const homepageDocRef = doc(db, 'pages', 'homepage');
    const homepageDocSnap = await getDoc(homepageDocRef);

    if (!homepageDocSnap.exists()) {
      throw error(404, 'Homepage content document not found in Firestore.');
    }
    const homepageData = homepageDocSnap.data();

    // 2. Helper function to fetch posts for our sliders
    const getPostsByCategory = async (category, postLimit = 10) => {
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('category', '==', category),
        orderBy('publishDate', 'desc'),
        limit(postLimit)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    // 3. Fetch all post categories at the same time for speed
    const [
      newPosts,
      attractionsPosts,
      culturePosts,
      naturePosts,
      historyPosts
    ] = await Promise.all([
      getPostsByCategory('new', 12),
      getPostsByCategory('attractions', 6),
      getPostsByCategory('culture', 6),
      getPostsByCategory('nature', 6),
      getPostsByCategory('history', 6),
    ]);

    // 4. Return all the data to the page component
    return {
      homepage: homepageData,
      sliders: {
        newPosts,
        attractionsPosts,
        culturePosts,
        naturePosts,
        historyPosts,
      },
    };
  } catch (err) {
    console.error("Failed to load homepage data from Firestore:", err);
    throw error(500, 'Could not connect to the database to load homepage content.');
  }
};