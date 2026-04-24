import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBT8jv057_JQL6pIUYk-U_LQ8uJHlFi-o",
  authDomain: "kal-marketplace.firebaseapp.com",
  projectId: "kal-marketplace",
  storageBucket: "kal-marketplace.firebasestorage.app",
  messagingSenderId: "745728416819",
  appId: "1:745728416819:web:da2dfb86cc5b79fb0d1746"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);  // Export Firebase Authentication
export const db = getDatabase(app);  // Export Firebase Realtime Database functions
export { ref, onValue };  // Export Realtime Database functions
