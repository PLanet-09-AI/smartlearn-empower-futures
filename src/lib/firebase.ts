
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2UhOKJ5faloWa4KlX7u3BSrPkReg2wNo",
  authDomain: "basic-buttress-428115-e3.firebaseapp.com",
  projectId: "basic-buttress-428115-e3",
  storageBucket: "basic-buttress-428115-e3.firebasestorage.app",
  messagingSenderId: "248620545578",
  appId: "1:248620545578:web:2209159ef3669991ad3553"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
