// Firebase configuration for Chrome Extension
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
   apiKey: "AIzaSyCO2SWODlfE5su8vy7vijLADVOdIlG8p_4",
   authDomain: "es-business.firebaseapp.com",
   projectId: "es-business",
   storageBucket: "es-business.firebasestorage.app",
   messagingSenderId: "866295393515",
   appId: "1:866295393515:web:501c1ad09967480d14e2ae",
   measurementId: "G-4F5KNMX2YF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
