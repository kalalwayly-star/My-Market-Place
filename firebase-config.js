<script type="module">
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

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

  // Initialize Realtime Database
  const database = getDatabase(app);

  // Example: Write data to Firebase Realtime Database
  const userId = "user1";
  const reference = ref(database, 'users/' + userId);
  set(reference, {
    username: "john_doe",
    email: "john@example.com",
    profile_picture: "http://example.com/profile.jpg"
  });

  // Example: Read data from Firebase Realtime Database
  const dbRef = ref(database);
  get(child(dbRef, `users/${userId}`)).then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val()); // This will log the data of user1
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  });
</script>
