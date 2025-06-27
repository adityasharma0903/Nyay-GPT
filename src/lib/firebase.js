// Firebase client config
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace with your Firebase project config!
const firebaseConfig = {
  apiKey: "AIzaSyAjj1XoHUr2ICzXrVskZIYzokz-lSKiYZE",
  authDomain: "chanakya-ai-c93c2.firebaseapp.com",
  projectId: "chanakya-ai-c93c2",
  storageBucket: "chanakya-ai-c93c2.firebasestorage.app",
  messagingSenderId: "300199911837",
  appId: "1:300199911837:web:9b54bdffbfbaa0b5554f74",
  measurementId: "G-K4C48CFRM8"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);