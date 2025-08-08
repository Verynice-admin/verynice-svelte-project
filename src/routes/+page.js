// src/routes/+page.js (UPDATED FOR HOMEPAGE)
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "$lib/services/firebase.js";

/** @type {import('./$types').PageLoad} */
export async function load() {
    try {
        // 1. Fetch the main document for the homepage
        const homepageDocRef = doc(db, 'pages', 'homepage');
        const homepageSnap = await getDoc(homepageDocRef);
        const homepageContent = homepageSnap.exists() ? homepageSnap.data() : null;

        // 2. Fetch featured posts
        const postsCollectionRef = collection(db, 'pages');
        const featuredQuery = query(
            postsCollectionRef, 
            where("isFeatured", "==", true),
            limit(3)
        );
        const featuredSnap = await getDocs(featuredQuery);
        const featuredPosts = featuredSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            homepageContent,
            featuredPosts
        };

    } catch (error) {
        console.error("Failed to load homepage data:", error);
        return {
            error: "Could not load homepage data.",
            homepageContent: null,
            featuredPosts: []
        };
    }
}