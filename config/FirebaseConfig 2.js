// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "multi-ai-577d1.firebaseapp.com",
  projectId: "multi-ai-577d1",
  storageBucket: "multi-ai-577d1.firebasestorage.app",
  messagingSenderId: "577249793800",
  appId: "1:577249793800:web:fc23678b623bd53f0c3ebd",
  measurementId: "G-41DTL4W605"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db=getFirestore(app)