import { auth, db, rtdb } from "./firebase-config.js";

// Full URLs for Auth
import { onAuthStateChanged, signOut } from "https://gstatic.com";

// Full URLs for Realtime Database
import { ref, onValue, remove } from "https://gstatic.com";

// Full URLs for Firestore
import { collection, onSnapshot, query } from "https://gstatic.com";


// Global variable to store ads
let globalAds = [];

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
});

/* =========================
   ADS LOAD FROM FIREBASE
========================= */
function initMain() {
    const listingsContainer = document.getElementById("listings");
    if (!listingsContainer) return;

    // Correct way to get ads from Firestore (where post.js sends them)
    const adsCollection = collection(db, "marketplace_ads");

    onSnapshot(adsCollection, (snapshot) => {
        globalAds = [];
        snapshot.forEach((doc) => {
            // Firestore uses doc.id for the key and doc.data() for the info
            globalAds.push({ ...doc.data(), firebaseId: doc.id });
        });

        renderAds(globalAds, "listings");
    });
}


document.addEventListener("DOMContentLoaded", initMain);


/* =========================
   GLOBAL HELPERS
========================= */
function getAds() {
    return globalAds;
}

window.goToDetails = function(id) {
    window.location.href = `details.html?id=${id}`;
};

import { deleteDoc, doc as firestoreDoc } from "https://gstatic.com";

window.deleteAd = async function(firebaseId) {
    if (confirm("Are you sure you want to delete this ad?")) {
        try {
            await deleteDoc(firestoreDoc(db, "marketplace_ads", firebaseId));
            alert("Ad deleted successfully");
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    }
};



/* =========================
   FILTERS (CLEAN VERSION)
========================= */
// UPDATED: filterByCategory
window.filterByCategory = function(category) {
    const allAds = getAds();
    let filteredAds = [];

    if (category === 'All') {
        filteredAds = allAds;  // If 'All' is selected, show all ads
    } else {
        filteredAds = allAds.filter(ad => ad.category === category);  // Filter by selected category
    }

    // Log filtered ads for debugging
    console.log("Filtered ads:", filteredAds);

    // Render filtered ads
    renderAds(filteredAds, "listings");

    // Show or hide "No items found" message based on the filtered results
    const noItemsMessage = document.getElementById('no-items-message');
    if (filteredAds.length === 0) {
        noItemsMessage.style.display = 'block';  // Show "No items found" if no ads match
    } else {
        noItemsMessage.style.display = 'none';  // Hide message if ads are found
    }
};

// UPDATED: Reset Filters
window.resetFilters = function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';  // Reset search input
    renderAds(getAds(), "listings");  // Render all ads
    const noItemsMessage = document.getElementById('no-items-message');
    noItemsMessage.style.display = 'none';  // Hide "No items found" message
};

// UPDATED: Apply Filters (search)
window.applyFilters = function() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
        renderAds(globalAds, "listings");  // If search is empty, show all ads
        return;
    }

    const filteredAds = globalAds.filter(ad =>
        ad.title.toLowerCase().includes(query) || 
        (ad.category || "").toLowerCase().includes(query)
    );

    renderAds(filteredAds, "listings");

    // Show or hide the "No items found" message based on the filtered results
    const noItemsMessage = document.getElementById('no-items-message');
    if (filteredAds.length === 0) {
        noItemsMessage.style.display = 'block';  // Show "No items found" if no matching ads
    } else {
        noItemsMessage.style.display = 'none';  // Hide message if ads are found
    }
};


/* =========================
   RENDER ADS
========================= */
window.renderAds = function(adsArray, containerId = "listings") {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";  // Clear the existing ads in the container

    // Log the filtered ads for debugging
    console.log("Filtered ads:", adsArray);

    if (!adsArray || adsArray.length === 0) {
        container.innerHTML = `<p style="text-align:center;">No items found.</p>`;  // If no ads match
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
