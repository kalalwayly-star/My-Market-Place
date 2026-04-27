// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js"; // Import Firebase Storage
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics.js"; // Import Firebase Analytics

// Firebase config (replace with your Firebase credentials)
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

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);  // Realtime Database
const storage = getStorage(app); // Firebase Storage

// Initialize Firebase Analytics
const analytics = getAnalytics(app); // Firebase Analytics initialization

// Export services for use in other files
export { auth, db, rtdb, storage, analytics }; // Now exporting analytics as well
