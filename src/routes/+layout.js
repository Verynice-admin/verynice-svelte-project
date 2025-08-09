// src/routes/+layout.js (FINAL, CORRECTED TO FETCH SEPARATE DOCUMENTS)

import { doc, getDoc } from "firebase/firestore";
import { db } from "$lib/services/firebase.js"; 

export async function load() {
    try {
        // --- [THE FIX IS HERE] ---
        // This now correctly points to the two separate documents that exist in your database.
        const headerDocRef = doc(db, "siteConfig", "headerConfig");
        const footerDocRef = doc(db, "siteConfig", "footerContent");

        const headerConfigSnap = await getDoc(headerDocRef);
        const footerConfigSnap = await getDoc(footerDocRef);

        const headerConfig = headerConfigSnap.exists() ? headerConfigSnap.data() : null;
        const footerConfig = footerConfigSnap.exists() ? footerConfigSnap.data() : null;

        // Add warnings in case one of them is missing, which helps in debugging.
        if (!headerConfig) {
            console.error("Firebase Load Error: Could not find document at path 'siteConfig/headerConfig'.");
        }
        if (!footerConfig) {
            console.error("Firebase Load Error: Could not find document at path 'siteConfig/footerContent'.");
        }

        return { headerConfig, footerConfig };
        
    } catch (error) {
        console.error("Failed to load global site configuration:", error);
        return { 
            headerConfig: null, 
            footerConfig: null, 
            error: "Could not load the site layout." // Pass an error message
        };
    }
}