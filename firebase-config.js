import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onValue, set, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth } from "https://gstatic.com"; // 1. Added Auth Import

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "kal-marketplace.firebaseapp.com",
  databaseURL: "https://kal-marketplace-default-rtdb.firebaseio.com",
  projectId: "kal-marketplace",
  storageBucket: "kal-marketplace.firebasestorage.app",
  messagingSenderId: "745728416819",
  appId: "1:745728416819:web:da2dfb86cc5b79fb0d1746"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app); // 2. Initialized Auth

export { db, auth, ref, push, onValue, set, remove }; // 3. Added auth to export




