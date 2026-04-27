// Import necessary Firebase services that have already been initialized in firebase-config.js
import { auth, db } from "./firebase-config.js";  // We import auth and db from firebase-config.js
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics.js";  // Analytics import
import { collection, getDocs, onSnapshot, query, where, deleteDoc, doc as firestoreDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";  // Firestore imports
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";  // Firebase Auth imports

let globalAds = []; // Declare globalAds at the top of the file to avoid the ReferenceError

// Firebase Analytics - Initialize once
const analytics = getAnalytics();

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

// Fetch the ads from Firestore and populate globalAds
function fetchAds() {
    // Reference the Firestore collection "marketplace_ads"
    const adsCollectionRef = collection(db, "marketplace_ads");

    // Fetch the ads from Firestore
    getDocs(adsCollectionRef)
        .then(snapshot => {
            // Populate globalAds with the ad data from Firestore
            globalAds = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id, // You can optionally store the Firestore doc ID
            }));

            // Call renderAds to display the fetched ads
            renderAds(globalAds);
        })
        .catch(error => {
            console.error("Error fetching ads:", error);
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
            </div>
        </div>`;
    }).join("");
}

// Call fetchAds when the page loads to display ads
window.onload = fetchAds;  // <-- This will call fetchAds on page load
// Delete ad functionality
window.deleteAd = async function(firebaseId) {
    if (confirm("Are you sure you want to delete this ad?")) {
        try {
            // Correct Firestore delete doc call
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
            globalAds.push({ ...doc.data(), id: doc.id });
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

// Fetch and display ads when the page loads
document.addEventListener("DOMContentLoaded", () => {
    fetchAds();  // Fetch ads and render them
});
