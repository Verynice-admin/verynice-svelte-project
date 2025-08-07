// src/lib/services/firebase.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAy3O-_uIAH9At0MD2Ql-Ay8YNk-nrvR1A",
  authDomain: "verynice-kz.firebaseapp.com",
  projectId: "verynice-kz",
  storageBucket: "verynice-kz.firebasestorage.app",
  messagingSenderId: "424542155018",
  appId: "1:424542155018:web:b56022354769fa2c330af3",
  measurementId: "G-9N5SZ59T2M"
};

// A variable to hold the initialized Firebase app
let app;

// Initialize Firebase, but only if it hasn't been initialized already.
// This check is essential to prevent re-initialization errors on both client and server.
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    // If it's already initialized, get the existing app instance.
    app = getApp();
}

// Export the initialized firestore instance.
// Any file that imports `db` will get this same, single instance.
export const db = getFirestore(app);