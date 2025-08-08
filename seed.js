// seed.js
// seed.js (CORRECTED)
import { initializeApp } from "firebase/app";
// --- [THE FIX IS HERE]: Added 'updateDoc' to the import list ---
import { getFirestore, doc, setDoc, updateDoc, writeBatch } from "firebase/firestore";

// IMPORTANT: Copy your Firebase config object here.
// You can find this in your `src/lib/services/firebase.js` file.
const firebaseConfig = {
  apiKey: "AIzaSyAy3O-_uIAH9At0MD2Ql-Ay8YNk-nrvR1A",
  authDomain: "verynice-kz.firebaseapp.com",
  projectId: "verynice-kz",
  storageBucket: "verynice-kz.firebasestorage.app",
  messagingSenderId: "424542155018",
  appId: "1:424542155018:web:b56022354769fa2c330af3",
  measurementId: "G-9N5SZ59T2M"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data for the site's global configuration
const siteConfigData = {
    'headerConfig': {
        logoUrlWhite: "/assets/logo-light.svg", // Correct path to your VeryNice logo
        logoAltText: "VeryNice.kz Logo",
        menuLinks: [
            { text: "Attractions", url: "/attractions" },
            { text: "Culture", url: "/culture" },
            { text: "Nature", url: "/nature" },
            { text: "History", url: "/history" },
            { text: "Travel tips", url: "/tips" },
            { text: "About Borat", url: "/borat" }
        ]
    },
    'footerContent': {
        copyrightTemplate: "© {year} All Rights Reserved.",
        footerMenuLinks: [
            { text: "About Us", url: "/about" },
            { text: "Our Team", url: "/team" },
            { text: "Advertising", url: "/advertising" },
            { text: "Contact", url: "/contacts" }
        ],
        techMenuLinks: [
            { text: "Terms & Copyright", url: "/rules" },
            { text: "Sitemap", url: "/sitemap" }
        ]
    }
};

// Data for individual pages
const pagesToCreate = {
  'homepage': {
    heroTitle: "Travel Portal",
    heroSubtitle: "for the true explorers",
    heroSearchPlaceholder: "Search...",
    heroSearchButtonText: "Find",
    heroBackgroundPublicId: "assets/images/history_page_images/main-background-image.webp",
    featuredTitle: "Featured Stories",
  }
};

async function seedDatabase() {
  console.log("Starting to seed database...");
  const batch = writeBatch(db);

  // Use the collection name "siteConfig"
  for (const [configId, configData] of Object.entries(siteConfigData)) {
      const configDocRef = doc(db, 'siteConfig', configId);
      batch.set(configDocRef, configData);
      console.log(`- Staged document: siteConfig/${configId}`);
  }

  for (const [pageId, pageData] of Object.entries(pagesToCreate)) {
    const pageDocRef = doc(db, 'pages', pageId);
    batch.set(pageDocRef, pageData);
    console.log(`- Staged document: pages/${pageId}`);
  }

  const historyPageRef = doc(db, 'pages', 'historyPage');
  batch.set(historyPageRef, { isFeatured: true }, { merge: true }); 
  console.log(`- Staged document for update: pages/historyPage (set isFeatured: true)`);
  
  try {
    await batch.commit();
    console.log("\n✅ Database seeded successfully!");
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
  }
}

seedDatabase();