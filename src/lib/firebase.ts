// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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
const app = initializeApp(firebaseConfig);

export { app };
