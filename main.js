// main.js

// Import initialized services from firebase-config.js
import { auth, db, rtdb } from "./firebase-config.js";  // Use the initialized rtdb here
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics.js";
import { collection, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";  // Import onSnapshot
// Firebase has already been initialized in firebase-config.js, no need to initialize again.
const analytics = getAnalytics();

// Use rtdb directly since it's already initialized in firebase-config.js
const database = rtdb;

// Firebase Auth state listener
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js"; 

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in
        console.log("User logged in:", user.email);
    } else {
        // User is logged out
        console.log("User logged out");
    }
});

// Global variable to store ads
let globalAds = [];

// DOMContentLoaded initialization
document.addEventListener("DOMContentLoaded", () => {
    const userInfoDiv = document.getElementById("user-info-header");
    const emailSpan = document.getElementById("header-user-email");
    const loginLink = document.getElementById("userAuth");
    const logoutBtn = document.getElementById("logout-btn");

    // Firebase authentication state listener
    onAuthStateChanged(auth, (user) => {
        if (user) {
            userInfoDiv.style.display = "block";
            emailSpan.innerText = user.email;
            loginLink.style.display = "none";
            logoutBtn.style.display = "inline-block";
        } else {
            userInfoDiv.style.display = "none";
            loginLink.style.display = "inline-block";
            logoutBtn.style.display = "none";
        }
    });

    // Logout functionality
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => window.location.href = "index.html");
    });

    // Load ads
    initMain();
});

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
