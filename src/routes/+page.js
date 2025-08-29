// In src/routes/+page.js (DEFINITIVE VERSION)

import { db } from '$lib/services/firebase';
import { getDoc, doc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { error } from '@sveltejs/kit';

export const load = async () => {
  try {
    const homepageDocRef = doc(db, 'pages', 'homepage');
    const homepageDocSnap = await getDoc(homepageDocRef);
    if (!homepageDocSnap.exists()) { throw error(404, 'Homepage content not found'); }
    const homepageData = homepageDocSnap.data();

    const getPostsByCategory = async (category, postLimit = 12) => {
      const q = query(collection(db, 'posts'), where('category', '==', category), orderBy('publishDate', 'desc'), limit(postLimit));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const [ newPosts, attractionsPosts, nationalParksPosts, lakesPosts, mountainsPosts, waterfallsPosts, landmarksPosts ] = await Promise.all([
      getPostsByCategory('new'),
      getPostsByCategory('attractions'),
      getPostsByCategory('national-parks'),
      getPostsByCategory('lakes'),
      getPostsByCategory('mountains'),
      getPostsByCategory('waterfalls'),
      getPostsByCategory('landmarks')
    ]);

    return {
      homepage: homepageData,
      sliders: { newPosts, attractionsPosts, nationalParksPosts, lakesPosts, mountainsPosts, waterfallsPosts, landmarksPosts },
    };
  } catch (err) {
    console.error("Failed to load homepage data:", err);
    throw error(500, 'Could not load homepage data');
  }
};