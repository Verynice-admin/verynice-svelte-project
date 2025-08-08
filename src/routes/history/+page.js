// src/routes/history/+page.js (CORRECTED with SSR GUARDS FOR VERCEL)

import { doc, getDoc, collection, getDocs, query, orderBy, updateDoc, increment } from "firebase/firestore";
import { db } from "$lib/services/firebase.js";

const CACHE_KEY = 'historyPageCache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export async function load({ depends }) {
    depends('app:history');
    
    const pageDocRef = doc(db, 'pages', 'historyPage');
    
    try {
        // NOTE: The server build cannot use the cache, this is a client-side enhancement.
        // The getCachedData function will correctly return null on the server.
        const cachedData = getCachedData();
        if (cachedData) {
            return cachedData;
        }
        
        await updateDoc(pageDocRef, { articleViews: increment(1) });
        
        const pageSnap = await getDoc(pageDocRef);
        if (!pageSnap.exists()) {
            throw new Error("Document 'pages/historyPage' not found in Firestore.");
        }
        
        const page = pageSnap.data();
        
        let sections = [];
        try {
            const sectionsQuery = query(collection(db, 'pages/historyPage/sections'), orderBy('order', 'asc'));
            const sectionsSnap = await getDocs(sectionsQuery);
            sections = sectionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (sectionsError) {
            console.error("Error fetching sections:", sectionsError);
        }
        
        let author = null;
        if (page.authorId && typeof page.authorId === 'string') {
            try {
                const authorDocRef = doc(db, 'authors', page.authorId);
                const authorSnap = await getDoc(authorDocRef);
                if (authorSnap.exists()) {
                    author = authorSnap.data();
                }
            } catch (authorError) {
                console.error("Error fetching author:", authorError);
            }
        }
        
        if (page.photoGallery && Array.isArray(page.photoGallery)) {
            page.photoGallery = page.photoGallery.map((item, index) => ({
                ...item,
                id: `photo-${index}`
            }));
        }
        
        const pageData = {
            page,
            sections,
            author,
            timestamp: Date.now()
        };
        
        cacheData(pageData);
        return pageData;

    } catch (error) {
        console.error("Failed to load history page data:", error);
        
        const cachedData = getCachedData();
        if (cachedData) {
            return {
                ...cachedData,
                error: "Could not load fresh data. Showing cached version."
            };
        }
        
        return {
            error: "Could not load page data. Please try again later.",
            page: null,
            sections: [],
            author: null
        };
    }
}

// --- [THE FIX IS HERE] ---
// These functions now check if 'localStorage' exists before trying to use it.
// This prevents the build from crashing on the server.
function getCachedData() {
    if (typeof localStorage === 'undefined') return null;
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp > CACHE_DURATION) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }
        return data;
    } catch (e) {
        return null;
    }
}

function cacheData(data) {
    if (typeof localStorage === 'undefined') return null;
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn("Failed to cache data:", e);
    }
}