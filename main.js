/* --- 1. CONFIGURATION & HELPERS --- */
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// Distance Helper (Haversine Formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Global Helper to get ads from the correct key
function getAds() {
    try {
        return JSON.parse(localStorage.getItem("marketplace_ads") || "[]");
    } catch (e) {
        console.error("Error parsing ads:", e);
        return [];
    }
}

// Global Helper to save ads
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
/* --- 3. UI RENDERING --- */
function renderAds(adsArray, containerId = "listings", userCoords = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";
    const isMyAdsPage = (containerId === "myAds");

    if (!adsArray || adsArray.length === 0) {
        container.innerHTML = `<p class='no-ads' style="text-align:center; width:100%; padding: 20px;" data-i18n="no_items_found">No items found.</p>`;
        return;
    }

    container.innerHTML = adsArray.map(ad => {
        const isSold = ad.status === 'Sold';
        const isFeatured = ad.isFeatured === true;
        
        // Calculate Distance display
        let distanceHTML = "";
        if (userCoords && ad.lat && ad.lng) {
            const d = calculateDistance(userCoords.lat, userCoords.lon, ad.lat, ad.lng);
            distanceHTML = `<span style="font-size:0.75rem; color:#28a745; font-weight: bold;">(${d.toFixed(1)} km)</span>`;
        }

        // Fix Image Logic
        let displayImage = 'https://placeholder.com';
        if (ad.image) {
            displayImage = Array.isArray(ad.image) ? ad.image[0] : ad.image;
        }

        return `
            <div class="card ${isFeatured ? 'featured-card' : ''}" 
                 onclick="${isMyAdsPage ? '' : `goToDetails('${ad.id}')`}" 
                 style="cursor:pointer; border:1px solid #ddd; border-radius:10px; background:white; margin-bottom:15px; overflow:hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <div style="height:180px; background:#f0f0f0;">
                    <img src="${displayImage}" alt="${ad.title}" onerror="this.src='https://placeholder.com'" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div style="padding:15px;">
                    <div style="display:flex; justify-content:space-between; align-items: center;">
                        <span style="font-size:0.8rem; color:#666; font-weight: bold; text-transform: uppercase;">${ad.category || "General"}</span>
                    </div>
                    <h3 style="margin:5px 0; font-size: 1.1rem;">${ad.title}</h3>
                    
                    <!-- LOCATION & DISTANCE SECTION -->
                    <p style="margin: 0; font-size: 0.85rem; color: #555;">
                        📍 ${ad.location || "Location N/A"} ${distanceHTML}
                    </p>

                    <p style="color:#007bff; font-size: 1.1rem; margin-top: 5px;"><strong>$${ad.price}</strong></p>
                </div>
            </div>
        `;
    }).join('');
}


/* --- 4. FILTERS --- */

// 75km Category Filter
function filterByCategory(category) {
    navigator.geolocation.getCurrentPosition((pos) => {
        const uCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        const allAds = getAds();
        
        const filtered = allAds.filter(ad => {
            const isMatch = ad.category === category;
            if (ad.lat && ad.lng) {
                const dist = calculateDistance(uCoords.lat, uCoords.lon, ad.lat, ad.lng);
                return isMatch && dist <= 75;
            }
            return isMatch;
        });
        renderAds(filtered, "listings", uCoords);
    }, () => {
        // Fallback if GPS blocked
        const filtered = getAds().filter(ad => ad.category === category);
        renderAds(filtered, "listings");
    });
}

// Search Button
function applyFilters() {
    const val = document.querySelector('.search-container input').value.toLowerCase();
    const filtered = getAds().filter(ad => ad.title.toLowerCase().includes(val));
    renderAds(filtered, "listings");
}

// View All Button
function resetFilters() {
    const activeAds = getAds().filter(ad => ad.status !== "Sold");
    renderAds(activeAds, "listings");
    // Clear search inputs
    const searchInput = document.querySelector('.search-container input');
    if (searchInput) searchInput.value = '';
}

/* --- 5. INITIALIZATION --- */
function initMain() {
    // Fill Homepage
    if (document.getElementById("listings")) {
        resetFilters();
    }
    
    // Fill My Ads Page
    const myAdsContainer = document.getElementById("myAds");
    if (myAdsContainer) {
        if (!currentUser) {
            myAdsContainer.innerHTML = "<p style='text-align:center; padding: 20px;'>Please login to see your ads.</p>";
        } else {
            const userAds = getAds().filter(ad => ad.userEmail === currentUser.email);
            renderAds(userAds, "myAds");
        }
    }
}

// Run logic when page loads
document.addEventListener("DOMContentLoaded", initMain);





