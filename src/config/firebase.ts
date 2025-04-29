import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBJBOv1llXnTx1fUJG8DZpvEK3lzt5eV0s",
  authDomain: "safehaven-458303.firebaseapp.com",
  projectId: "safehaven-458303",
  storageBucket: "safehaven-458303.firebasestorage.app",
  messagingSenderId: "7364434746",
  appId: "1:7364434746:web:bf7dbfe449ab867443ce03",
  measurementId: "G-BB47XH4BBD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Initialize Firebase Cloud Messaging (only on web)
let messaging = null;
if (typeof window !== 'undefined') {
  isSupported().then(isSupported => {
    if (isSupported) {
      messaging = getMessaging(app);
    }
  });
}

export { app, analytics, auth, firestore, database, storage, messaging };
