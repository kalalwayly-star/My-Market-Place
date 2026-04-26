// Import the Firebase services that have already been initialized in firebase-config.js
import { auth, rtdb } from "./firebase-config.js";  // We import auth from firebase-config.js, as it’s already initialized.
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics.js";  // Analytics import
import { collection, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";  // Firestore imports
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";  // Firebase Auth imports

// Firebase Analytics - Initialize once
const analytics = getAnalytics();

// Firebase Realtime Database - Using already initialized `rtdb` from firebase-config.js
const database = rtdb;  // We don't need to initialize getDatabase() again because it's already done in firebase-config.js

// Firebase Auth state listener to manage user login status
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
            window.location.href = "index.html";  // Redirect to home page after logging out
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

    // Apply query if there's search text
    if (queryText) {
        adsQuery = query(adsQuery, where("title", "array-contains", queryText));
    }

    // Fetch the results with onSnapshot
    onSnapshot(adsQuery, (snapshot) => {
        globalAds = [];
        snapshot.forEach((doc) => {
            globalAds.push({ ...doc.data(), firebaseId: doc.id });
        });
        renderAds(globalAds);  // Render the filtered ads
        toggleNoItemsMessage(globalAds);  // Toggle "No items" message based on the results
    });
};

// Toggle the "No Items" message if no ads are found
function toggleNoItemsMessage(ads) {
    const noItemsMessage = document.getElementById('no-items-message');
    if (noItemsMessage) {
        noItemsMessage.style.display = ads.length === 0 ? 'block' : 'none';
    }
}
