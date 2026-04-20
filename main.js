/* --- 1. CONFIGURATION & HELPERS --- */
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

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

function getAds() {
    try {
        return JSON.parse(localStorage.getItem("marketplace_ads") || "[]");
    } catch (e) {
        return [];
    }
}

function saveAds(adsArray) {
    localStorage.setItem("marketplace_ads", JSON.stringify(adsArray));
}

/* --- 2. ACTIONS --- */
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

function goToDetails(id) {
    window.location.href = `details.html?id=${id}`;
}

/* --- 3. UI RENDERING --- */
function renderAds(adsArray, containerId = "listings", userCoords = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";
    const isMyAdsPage = (containerId === "myAds");

    if (!adsArray || adsArray.length === 0) {
        container.innerHTML = `<p class='no-ads' style="text-align:center; width:100%;">No items found.</p>`;
        return;
    }

    container.innerHTML = adsArray.map(ad => {
        const isSold = ad.status === 'Sold';
        const isFeatured = ad.isFeatured === true;
        
        let distanceHTML = "";
        if (userCoords && ad.lat && ad.lng) {
            const d = calculateDistance(userCoords.lat, userCoords.lon, ad.lat, ad.lng);
            distanceHTML = `<span style="font-size:0.75rem; color:#28a745;">📍 ${d.toFixed(1)} km</span>`;
        }

        const displayImage = Array.isArray(ad.image) ? ad.image[0] : (ad.image || 'https://placeholder.com');

        return `
            <div class="card ${isFeatured ? 'featured-card' : ''}" 
                 onclick="${isMyAdsPage ? '' : `goToDetails('${ad.id}')`}" 
                 style="cursor:pointer; border:1px solid #ddd; border-radius:10px; background:white; margin-bottom:15px; overflow:hidden;">
                <div style="height:180px; background:#f0f0f0;">
                    <img src="${displayImage}" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div style="padding:15px;">
                    <div style="display:flex; justify-content:space-between;">
                        <span style="font-size:0.8rem; color:#666;">${ad.category || "General"}</span>
                        ${distanceHTML}
                    </div>
                    <h3 style="margin:5px 0;">${ad.title}</h3>
                    <p style="color:#007bff;"><strong>$${ad.price}</strong></p>
                </div>
            </div>
        `;
    }).join('');
}

/* --- 4. FILTERS --- */
function filterByCategory(category) {
    navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        const filtered = getAds().filter(ad => ad.category === category && (!ad.lat || calculateDistance(coords.lat, coords.lon, ad.lat, ad.lng) <= 75));
        renderAds(filtered, "listings", coords);
    }, () => {
        renderAds(getAds().filter(ad => ad.category === category), "listings");
    });
}

function applyFilters() {
    const val = document.querySelector('.search-container input').value.toLowerCase();
    const filtered = getAds().filter(ad => ad.title.toLowerCase().includes(val));
    renderAds(filtered, "listings");
}

function resetFilters() {
    renderAds(getAds().filter(ad => ad.status !== "Sold"), "listings");
}

/* --- 5. INIT --- */
function initMain() {
    if (document.getElementById("listings")) resetFilters();
    
    const myAdsContainer = document.getElementById("myAds");
    if (myAdsContainer && currentUser) {
        const userAds = getAds().filter(ad => ad.userEmail === currentUser.email);
        renderAds(userAds, "myAds");
    }
}

document.addEventListener("DOMContentLoaded", initMain);




