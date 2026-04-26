// main.js
import { auth, db, rtdb } from "./firebase-config.js";  // Use the initialized rtdb here
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics.js";
import { collection, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";  // Import onSnapshot
// Firebase has already been initialized in firebase-config.js, no need to initialize again.
const analytics = getAnalytics();

// Use rtdb directly since it's already initialized in firebase-config.js
const database = rtdb;
// Import necessary functions from Firebase SDK
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

// Import Firebase Realtime Database methods from the correct URL (if needed)
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";

// Initialize Firebase Auth and Database (Ensure you've initialized Firebase in firebase-config.js)
const auth = getAuth();
const db = getDatabase();
// Firebase Auth state listener

onAuthStateChanged(auth, (user) => {
    const loginLink = document.getElementById("userAuth");
    const logoutBtn = document.getElementById("logout-btn");
    const emailSpan = document.getElementById("header-user-email");
    const userInfoDiv = document.getElementById("user-info-header");

    if (user) {
        // User is logged in
        if (userInfoDiv) userInfoDiv.style.display = "block";  // Show user info div
        if (emailSpan) emailSpan.innerText = user.email;  // Display user email
        if (loginLink) loginLink.style.display = "none";  // Hide login link
        if (logoutBtn) logoutBtn.style.display = "inline-block";  // Show logout button
    } else {
        // User is logged out
        if (userInfoDiv) userInfoDiv.style.display = "none";  // Hide user info div
        if (loginLink) loginLink.style.display = "inline-block";  // Show login link
        if (logoutBtn) logoutBtn.style.display = "none";  // Hide logout button
    }
});

// Logout button click event handler
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            // Successfully logged out
            window.location.href = "index.html";  // Redirect to the home page after logging out
        }).catch((error) => {
            // Error during logout
            console.error("Logout error: ", error);
            alert("There was an error logging out. Please try again.");
        });
    });
}

// Logout button click event handler
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            // Successfully logged out
            window.location.href = "index.html";  // Redirect to the home page after logging out
        }).catch((error) => {
            // Error during logout
            console.error("Logout error: ", error);
            alert("There was an error logging out. Please try again.");
        });
    });
}
// Initialize ads loading from Firestore
function initMain() {
    const listingsContainer = document.getElementById("listings");
    if (!listingsContainer) return;

    const adsCollection = collection(db, "marketplace_ads");

    onSnapshot(adsCollection, (snapshot) => {
        globalAds = [];
        snapshot.forEach((doc) => {
            globalAds.push({ ...doc.data(), firebaseId: doc.id });
        });
        renderAds(globalAds);
    });
}

// Render ads to the DOM
function renderAds(adsArray) {
    const container = document.getElementById("listings");
    container.innerHTML = adsArray.map(ad => {
        const uniqueId = ad.firebaseId;
        const image = Array.isArray(ad.image) ? ad.image[0] : (ad.image || 'https://via.placeholder.com/300');
        return `
        <div class="card">
            <div onclick="goToDetails('${uniqueId}')">
                <img src="${image}" style="width:100%; height:200px; object-fit:cover;">
            </div>
            <div class="card-content">
                <h3>${ad.title}</h3>
                <p>📍 ${ad.location || "No location"}</p>
                <p><b>$${ad.price}</b></p>
                <button onclick="deleteAd('${uniqueId}')">Delete</button>
            </div>
        </div>`;
    }).join("");
}

// Go to ad details
window.goToDetails = function(id) {
    window.location.href = `details.html?id=${id}`;
};

// Delete ad functionality
window.deleteAd = async function(firebaseId) {
    if (confirm("Are you sure you want to delete this ad?")) {
        try {
            await deleteDoc(firestoreDoc(db, "marketplace_ads", firebaseId));
            alert("Ad deleted successfully");
        } catch (error) {
            console.error("Error deleting ad:", error);
            alert("Error deleting ad. Check console.");
        }
    }
};

// Filter ads by category
window.filterByCategory = function(category) {
    const filteredAds = (category === 'All') ? globalAds : globalAds.filter(ad => ad.category === category);
    renderAds(filteredAds);
    toggleNoItemsMessage(filteredAds);
};

// Reset filters and show all ads
window.resetFilters = function() {
    renderAds(globalAds);
    toggleNoItemsMessage(globalAds);
};

// Apply filters for search
window.applyFilters = function() {
    const queryText = document.getElementById('searchInput')?.value.toLowerCase().trim();

    let adsQuery = collection(db, "marketplace_ads");

    if (queryText) {
        adsQuery = query(adsQuery, where("title", "array-contains", queryText));
    }

    onSnapshot(adsQuery, (snapshot) => {
        globalAds = [];
        snapshot.forEach((doc) => {
            globalAds.push({ ...doc.data(), firebaseId: doc.id });
        });
        renderAds(globalAds);
        toggleNoItemsMessage(globalAds);
    });
};

// Toggle no items message
function toggleNoItemsMessage(ads) {
    const noItemsMessage = document.getElementById('no-items-message');
    if (noItemsMessage) {
        noItemsMessage.style.display = ads.length === 0 ? 'block' : 'none';
    }
}

// Handle the logout functionality
document.getElementById("logoutBtn").addEventListener("click", function() {
    signOut(auth)
        .then(() => {
            // Successfully signed out, redirect to login page
            window.location.href = "login.html";  // Or wherever you want the user to go after logout
        })
        .catch((error) => {
            console.error("Error signing out:", error);
        });
});
