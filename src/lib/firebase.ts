
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration - using hardcoded values for now
// In a production environment, these would typically come from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyAHdOgGa1dMfVCmaqOUCBZcx9kKrrYeRbU",
  authDomain: "newdb-719e2.firebaseapp.com",
  projectId: "newdb-719e2",
  storageBucket: "newdb-719e2.appspot.com",
  messagingSenderId: "151706210941",
  appId: "1:151706210941:web:e66bd48f095ae64247d714"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
