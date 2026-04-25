// 1. CLEAN IMPORTS (All at the top with FULL URLs)
import { auth, db } from "./firebase-config.js";

// Full URLs to prevent CORS errors
import { onAuthStateChanged, signOut } from "https://gstatic.com";
import { collection, onSnapshot, deleteDoc, doc as firestoreDoc } from "https://gstatic.com";

// Global variable to store ads
let globalAds = [];

/* =========================
   INITIALIZATION
========================= */
document.addEventListener("DOMContentLoaded", () => {
    const userInfoDiv = document.getElementById("user-info-header");
    const emailSpan = document.getElementById("header-user-email");
    const loginLink = document.getElementById("userAuth");
    const logoutBtn = document.getElementById("logout-btn");

    // Firebase authentication state listener
    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (userInfoDiv) userInfoDiv.style.display = "block";
            if (emailSpan) emailSpan.innerText = user.email;
            if (loginLink) loginLink.style.display = "none";
            if (logoutBtn) logoutBtn.style.display = "inline-block";
        } else {
            if (userInfoDiv) userInfoDiv.style.display = "none";
            if (loginLink) loginLink.style.display = "inline-block";
            if (logoutBtn) logoutBtn.style.display = "none";
        }
    });

    // Logout button event listener
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            signOut(auth).then(() => {
                window.location.href = "index.html";
            });
        });
    }

    // Load Ads
    initMain();
});

/* =========================
   ADS LOAD FROM FIREBASE
========================= */
function initMain() {
    const listingsContainer = document.getElementById("listings");
    if (!listingsContainer) return;

    // Listen to Firestore
    const adsCollection = collection(db, "marketplace_ads");

    onSnapshot(adsCollection, (snapshot) => {
        globalAds = [];
        snapshot.forEach((doc) => {
            globalAds.push({ ...doc.data(), firebaseId: doc.id });
        });
        renderAds(globalAds, "listings");
    });
}

/* =========================
   GLOBAL HELPERS
========================= */
window.goToDetails = function(id) {
    window.location.href = `details.html?id=${id}`;
};

window.deleteAd = async function(firebaseId) {
    if (confirm("Are you sure you want to delete this ad?")) {
        try {
            await deleteDoc(firestoreDoc(db, "marketplace_ads", firebaseId));
            alert("Ad deleted successfully");
        } catch (error) {
            console.error("Error deleting document: ", error);
            alert("Error deleting ad. Check console.");
        }
    }
};

/* =========================
   FILTERS
========================= */
window.filterByCategory = function(category) {
    let filteredAds = (category === 'All') 
        ? globalAds 
        : globalAds.filter(ad => ad.category === category);

    renderAds(filteredAds, "listings");

    const noItemsMessage = document.getElementById('no-items-message');
    if (noItemsMessage) {
        noItemsMessage.style.display = (filteredAds.length === 0) ? 'block' : 'none';
    }
};

window.resetFilters = function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    renderAds(globalAds, "listings");
    const noItemsMessage = document.getElementById('no-items-message');
    if (noItemsMessage) noItemsMessage.style.display = 'none';
};

window.applyFilters = function() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput?.value.toLowerCase().trim();

    if (!query) {
        renderAds(globalAds, "listings");
        return;
    }

    const filteredAds = globalAds.filter(ad =>
        (ad.title || "").toLowerCase().includes(query) || 
        (ad.category || "").toLowerCase().includes(query)
    );

    renderAds(filteredAds, "listings");

    const noItemsMessage = document.getElementById('no-items-message');
    if (noItemsMessage) {
        noItemsMessage.style.display = (filteredAds.length === 0) ? 'block' : 'none';
    }
};

/* =========================
   RENDER ADS
========================= */
window.renderAds = function(adsArray, containerId = "listings") {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    if (!adsArray || adsArray.length === 0) {
        container.innerHTML = `<p style="text-align:center;">No items found.</p>`;
        return;
    }

    container.innerHTML = adsArray.map(ad => {
        const uniqueId = ad.firebaseId;
        const image = Array.isArray(ad.image) ? ad.image[0] : (ad.image || 'https://via.placeholder.com/300');

        return `
        <div class="card">
            <div onclick="goToDetails('${uniqueId}')" style="cursor:pointer;">
                <img src="${image}" style="width:100%; height:200px; object-fit:cover;">
            </div>
            <div class="card-content">
                <h3>${ad.title}</h3>
                <p>📍 ${ad.location || "No location"}</p>
                <p><b>$${ad.price}</b></p>
                <button onclick="deleteAd('${uniqueId}')">Delete</button>
            </div>
        </div>
        `;
    }).join("");
};
