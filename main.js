import { db, ref, onValue, push, remove, auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://gstatic.com";

let globalAds = [];
let uploadedImages = []; 

// 1. LOGIN LISTENER (Fixed link and logic)
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

// 2. SEARCH & DISTANCE LOGIC
const SEARCH_RELATIONS = {
    "pants": ["clothing", "fashion", "jeans", "trousers", "t-shirt", "shirt", "apparel"],
    "t-shirt": ["clothing", "fashion", "top", "shirt", "apparel"],
    "car": ["vehicle", "truck", "toyota", "honda", "auto", "transport"],
    "furniture": ["chair", "table", "sofa", "bed", "home decor"],
    "phone": ["iphone", "samsung", "electronics", "mobile", "tech"]
};

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function getAds() { return globalAds; }

// 3. GLOBAL ACTIONS (Attached to window so buttons work)
window.logout = function() {
    signOut(auth).then(() => {
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
    });
}

window.goToDetails = function(id) {
    window.location.href = `details.html?id=${id}`;
}

window.deleteAd = function(firebaseId) {
    if (confirm("Are you sure you want to delete this ad?")) {
        const adRef = ref(db, `marketplace_ads/${firebaseId}`);
        remove(adRef)
            .then(() => alert("Ad deleted successfully."))
            .catch((error) => alert("Error: " + error.message));
    }
}

// 4. UI RENDERING
window.renderAds = function(adsArray, containerId = "listings", userCoords = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    const isMyAdsPage = (containerId === "myAds");

    if (!adsArray || adsArray.length === 0) {
        container.innerHTML = `<p class='no-ads' style="text-align:center; width:100%; padding: 20px;">No items found.</p>`;
        return;
    }

    container.innerHTML = adsArray.map(ad => {
        const isFeatured = ad.isFeatured === true;
        const uniqueId = ad.firebaseId || ad.id;
        let displayImage = Array.isArray(ad.image) ? ad.image[0] : (typeof ad.image === "string" ? ad.image : (ad.images?.[0] || 'https://via.placeholder.com/300'));
        
        return `
            <div class="card ${isFeatured ? 'featured-card' : ''}">
                <div onclick="goToDetails('${uniqueId}')" style="cursor:pointer; aspect-ratio:1/1; background:#f0f0f0; overflow:hidden;">
                    <img src="${displayImage}" alt="${ad.title}" onerror="this.src='https://via.placeholder.com/300'" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div class="card-content">
                    <span class="category-label">${ad.category || "General"}</span>
                    <h3 onclick="goToDetails('${uniqueId}')">${ad.title}</h3>
                    <p class="location">📍 ${ad.location || "Location N/A"}</p>
                    <p class="price"><strong>$${ad.price}</strong></p>
                    ${isMyAdsPage ? `<button onclick="deleteAd('${uniqueId}')" class="btn-delete">Delete Ad</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// 5. FILTERS
window.filterByCategory = function(category) {
    const filtered = getAds().filter(ad => ad.category === category);
    renderAds(filtered, "listings");
}

window.applyFilters = function() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    const query = searchInput.value.toLowerCase().trim();
    if (!query) { resetFilters(); return; }
    const filtered = getAds().filter(ad => ad.title.toLowerCase().includes(query) || (ad.category || "").toLowerCase().includes(query));
    renderAds(filtered, "listings");
}

window.resetFilters = function() {
    renderAds(globalAds, "listings");
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
}

// 6. INITIALIZATION
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
        renderAds(globalAds);
    });
}

document.addEventListener("DOMContentLoaded", initMain);










