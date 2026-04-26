// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";
import { firebaseConfig, auth, db, rtdb } from './firebase-config.js';.

// Your Firebase config (you'll get this from Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyDBT8jv057_JQL6pIUYk-U_LQ8uJHlFi-o",
  authDomain: "kal-marketplace.firebaseapp.com",
  databaseURL: "https://kal-marketplace-default-rtdb.firebaseio.com",
  projectId: "kal-marketplace",
  storageBucket: "kal-marketplace.firebasestorage.app",
  messagingSenderId: "745728416819",
  appId: "1:745728416819:web:da2dfb86cc5b79fb0d1746",
  measurementId: "G-FFHYQC4YJV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth, Firestore, and Realtime Database
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);  // Realtime Database

// Export the initialized services to use in other files
export { firebaseConfig, auth, db, rtdb };
