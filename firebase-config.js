import { initializeApp } from "https://gstatic.com";
import { getDatabase, ref, push, onValue, set, remove } from "https://gstatic.com";


const firebaseConfig = {
  apiKey: "AIzaSyDBT8jv057_JQL6pIUYk-U_LQ8uJHlFi-o",
  authDomain: "://firebaseapp.com",
  databaseURL: "https://firebaseio.com",
  projectId: "kal-marketplace",
  storageBucket: "kal-marketplace.firebasestorage.app",
  messagingSenderId: "745728416819",
  appId: "1:745728416819:web:da2dfb86cc5b79fb0d1746",
  measurementId: "G-FFHYQC4YJV"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, push, onValue, set, remove };







