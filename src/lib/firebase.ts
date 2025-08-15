
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "wg-campus",
  "appId": "1:1071617999329:web:1dde57bcc83611b1cc52a0",
  "storageBucket": "wg-campus.firebasestorage.app",
  "apiKey": "AIzaSyDf1Mp_0EZW3Ao6ADMpYqejOuvyuKmxsLQ",
  "authDomain": "wg-campus.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1071617999329"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
