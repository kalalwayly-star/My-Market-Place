import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBT8jv057_JQL6pIUYk-U_LQ8uJHlFi-o",
  authDomain: "kal-marketplace.firebaseapp.com",
  databaseURL: "https://kal-marketplace-default-rtdb.firebaseio.com",
  projectId: "kal-marketplace",
  storageBucket: "kal-marketplace.firebasestorage.app",
  messagingSenderId: "745728416819",
  appId: "1:745728416819:web:da2dfb86cc5b79fb0d1746"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
const db = getDatabase(app);
const auth = getAuth(app);

// 🔥 IMPORTANT: persistence must be AFTER auth init
setPersistence(auth, browserLocalPersistence);

export { db, auth };



