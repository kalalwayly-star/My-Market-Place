// firebase-config.js

// Import the necessary functions from the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";

// Your web app's Firebase configuration
export const firebaseConfig = {
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

// Initialize other Firebase services you need
const auth = getAuth(app); // Authentication
const database = getDatabase(app); // Realtime Database

// Export the Firebase services you want to use
export { app, auth, database };
