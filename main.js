import { db, ref, onValue, remove, auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let globalAds = [];

/* =========================
   AUTH LISTENER (NAVBAR)
========================= */
document.addEventListener("DOMContentLoaded", () => {

    onAuthStateChanged(auth, (user) => {

        const userInfoDiv = document.getElementById("user-info-header");
        const emailSpan = document.getElementById("header-user-email");
        const loginLink = document.getElementById("userAuth");
        const logoutBtn = document.getElementById("logout-btn");

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

    /* LOGOUT */
    const logoutBtn = document.getElementById("logout-btn");

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
window.filterByCategory = function(category) {
    const filtered = getAds().filter(ad => ad.category === category);
    renderAds(filtered, "listings");
};

window.applyFilters = function() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
        renderAds(globalAds, "listings");
        return;
    }

    const filtered = getAds().filter(ad =>
        ad.title.toLowerCase().includes(query) ||
        (ad.category || "").toLowerCase().includes(query)
    );

    renderAds(filtered, "listings");
};

window.resetFilters = function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    renderAds(globalAds, "listings");
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







