// src/routes/+layout.js (CORRECTED COLLECTION PATH)

import { doc, getDoc } from "firebase/firestore";
import { db } from "$lib/services/firebase.js"; 

export async function load() {
    try {
        // --- [THE FIX IS HERE]: The collection name is now "siteConfig" ---
        const headerDocRef = doc(db, "siteConfig", "headerConfig");
        const footerDocRef = doc(db, "siteConfig", "footerContent");

        const headerConfigSnap = await getDoc(headerDocRef);
        const footerConfigSnap = await getDoc(footerDocRef);

        const headerConfig = headerConfigSnap.exists() ? headerConfigSnap.data() : null;
        const footerConfig = footerConfigSnap.exists() ? footerConfigSnap.data() : null;

        if (!headerConfig) {
            console.error("Firebase Load Error: Could not find document at path 'siteConfig/headerConfig'.");
        }
        if (!footerConfig) {
            console.error("Firebase Load Error: Could not find document at path 'siteConfig/footerContent'.");
        }

        return { headerConfig, footerConfig };
        
    } catch (error)
        console.error("Failed to load site configuration:", error);
        return { headerConfig: null, footerConfig: null, error: "Could not load site layout." };
    }
}