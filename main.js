import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

    const userInfoDiv = document.getElementById("user-info-header");
    const emailSpan = document.getElementById("header-user-email");
    const loginLink = document.getElementById("userAuth");
    const logoutBtn = document.getElementById("logout-btn");

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
    const adsRef = ref(db, "marketplace_ads");

    onValue(adsRef, (snapshot) => {
        const data = snapshot.val();
        globalAds = [];

        if (data) {
            Object.keys(data).forEach(key => {
                globalAds.push({ ...data[key], firebaseId: key });
            });
        }

        renderAds(globalAds, "listings");
    });
   onAuthStateChanged(auth, (user) => {

    const isMyAdsPage = document.getElementById("myAds");

    if (isMyAdsPage && user) {

        const myAds = globalAds.filter(ad => ad.userId === user.uid);

        renderAds(myAds, "myAds");

    } else if (isMyAdsPage) {

        document.getElementById("myAds").innerHTML =
            "Please login to see your ads.";
    }
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

window.deleteAd = function(firebaseId) {
    if (confirm("Are you sure you want to delete this ad?")) {
        const adRef = ref(db, `marketplace_ads/${firebaseId}`);
        remove(adRef);
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

    // Render filtered ads
    renderAds(filteredAds, "listings");

    // Show or hide "No items found" message
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

/* =========================
   RENDER ADS
========================= */
window.renderAds = function(adsArray, containerId = "listings") {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";  // Clear the existing ads in the container

    if (!adsArray || adsArray.length === 0) {
        container.innerHTML = `<p style="text-align:center;">No items found.</p>`;
        return;
    }

    container.innerHTML = adsArray.map(ad => {
        const uniqueId = ad.firebaseId;
        const image = Array.isArray(ad.image)
            ? ad.image[0]
            : (ad.image || 'https://via.placeholder.com/300');

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
