// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";  // Added missing auth import
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";

// Your web app's Firebase configuration
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

// Initialize Authentication and Database
const auth = getAuth(app);  // Initialize Firebase Auth
const database = getDatabase(app);  // Initialize Firebase Database

// Export the instances to use them elsewhere
export { app, auth, database };
