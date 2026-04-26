  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics.js";
  import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";

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

  const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { app, auth, database };
