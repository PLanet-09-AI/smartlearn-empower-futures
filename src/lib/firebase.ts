
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration - using hardcoded values for now
// In a production environment, these would typically come from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD2UhOKJ5faloWa4KlX7u3BSrPkReg2wNo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "basic-buttress-428115-e3.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "basic-buttress-428115-e3",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "basic-buttress-428115-e3.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "248620545578",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:248620545578:web:2209159ef3669991ad3553"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
