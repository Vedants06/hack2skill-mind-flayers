import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAG87b7JzzrFR5izGyH77UnglP9dwP6Gk",
  authDomain: "hack2skill-b3369.firebaseapp.com",
  projectId: "hack2skill-b3369",
  storageBucket: "hack2skill-b3369.firebasestorage.app",
  messagingSenderId: "286769407800",
  appId: "1:286769407800:web:2a852cd62d957c666443cd",
  measurementId: "G-QGB8SZDZNF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;