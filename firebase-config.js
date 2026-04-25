// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
// Added 'collection' and 'addDoc' here
import { getFirestore, doc, getDoc, collection, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
// Added 'get', 'set', and 'push' for Realtime Database
import { getDatabase, ref, onValue, get, set, push } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBT8jv057_JQL6pIUYk-U_LQ8uJHlFi-o",
  authDomain: "kal-marketplace.firebaseapp.com",
  projectId: "kal-marketplace",
  storageBucket: "kal-marketplace.firebasestorage.app",
  messagingSenderId: "745728416819",
  appId: "1:745728416819:web:da2dfb86cc5b79fb0d1746"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); 
export const rtdb = getDatabase(app);

// Exporting everything so your other files can use them easily
export { 
    doc, getDoc, collection, addDoc, deleteDoc, 
    ref, onValue, get, set, push 
};

