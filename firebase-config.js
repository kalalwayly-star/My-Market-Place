// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js"; // Firebase App
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js"; // Firebase Authentication
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js"; // Firestore
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js"; // Realtime Database

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBT8jv057_JQL6pIUYk-U_LQ8uJHlFi-o",
  authDomain: "kal-marketplace.firebaseapp.com",
  projectId: "kal-marketplace",
  storageBucket: "kal-marketplace.firebasestorage.app",
  messagingSenderId: "745728416819",
  appId: "1:745728416819:web:da2dfb86cc5b79fb0d1746"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app); // Firestore for adding and querying ads

// Initialize Realtime Database
export const rtdb = getDatabase(app);  // Realtime Database

// Export Firestore document functions
export { doc, getDoc };  // Functions to interact with Firestore documents

// Export Realtime Database functions
export { ref, onValue };  // Functions to interact with Realtime Database
