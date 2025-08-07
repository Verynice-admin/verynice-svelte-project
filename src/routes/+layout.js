// src/routes/+layout.js (CLEANED)

import { doc, getDoc } from "firebase/firestore";
import { db } from "$lib/services/firebase.js"; 

export async function load() {
    try {
        const headerDocRef = doc(db, "siteConfig", "headerConfig");
        const footerDocRef = doc(db, "siteConfig", "footerContent");

        const headerConfigSnap = await getDoc(headerDocRef);
        const footerConfigSnap = await getDoc(footerDocRef);

        const headerConfig = headerConfigSnap.exists() ? headerConfigSnap.data() : null;
        const footerConfig = footerConfigSnap.exists() ? footerConfigSnap.data() : null;

        return { headerConfig, footerConfig };
        
    } catch (error) {
        console.error("Failed to load site configuration:", error);
        return { headerConfig: null, footerConfig: null };
    }
}