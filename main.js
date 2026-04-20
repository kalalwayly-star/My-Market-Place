const SEARCH_RELATIONS = {
    "pants": ["clothing", "fashion", "jeans", "trousers", "t-shirt", "shirt", "apparel"],
    "t-shirt": ["clothing", "fashion", "top", "shirt", "apparel"],
    "car": ["vehicle", "truck", "toyota", "honda", "auto", "transport"],
    "furniture": ["chair", "table", "sofa", "bed", "home decor"],
    "phone": ["iphone", "samsung", "electronics", "mobile", "tech"]
};

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
        console.error("Error parsing ads:", e);
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
        container.innerHTML = `<p class='no-ads' style="text-align:center; width:100%; padding: 20px;">No items found.</p>`;
        return;
    }

    container.innerHTML = adsArray.map(ad => {
        const isFeatured = ad.isFeatured === true;
        let displayImage = ad.image && Array.isArray(ad.image) ? ad.image[0] : (ad.image || 'https://placeholder.com');

        return `
            <div class="card ${isFeatured ? 'featured-card' : ''}" 
                 style="border:1px solid #ddd; border-radius:10px; background:white; margin-bottom:15px; overflow:hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <div onclick="goToDetails('${ad.id}')" style="cursor:pointer; height:180px; background:#f0f0f0;">
                    <img src="${displayImage}" alt="${ad.title}" onerror="this.src='https://placeholder.com'" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div style="padding:15px;">
                    <div style="display:flex; justify-content:space-between; align-items: center;">
                        <span style="font-size:0.8rem; color:#666; font-weight: bold; text-transform: uppercase;">${ad.category || "General"}</span>
                    </div>
                    <h3 style="margin:5px 0; font-size: 1.1rem; cursor:pointer;" onclick="goToDetails('${ad.id}')">${ad.title}</h3>
                    <p style="margin: 0; font-size: 0.85rem; color: #555;">📍 ${ad.location || "Location N/A"}</p>
                    <p style="color:#007bff; font-size: 1.1rem; margin-top: 5px;"><strong>$${ad.price}</strong></p>
                    
                    ${isMyAdsPage ? `
                        <button onclick="deleteAd('${ad.id}')" 
                                style="margin-top:10px; width:100%; background:#ff4d4d; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer; font-weight:bold;">
                                Delete Ad
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

/* --- 4. FILTERS --- */
function applyFilters() {
    const searchInput = document.querySelector('.search-container input');
    if (!searchInput) return;
    
    const query = searchInput.value.toLowerCase().trim();
    if (!query) { resetFilters(); return; }

    const relatedTerms = SEARCH_RELATIONS[query] || [];
    
    navigator.geolocation.getCurrentPosition((pos) => {
        const uCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        const filtered = getAds().filter(ad => {
            const title = ad.title.toLowerCase();
            const cat = (ad.category || "").toLowerCase();
            return title.includes(query) || cat.includes(query) || relatedTerms.some(t => title.includes(t));
        });

        filtered.sort((a, b) => {
            if (!a.lat || !a.lng) return 1;
            if (!b.lat || !b.lng) return -1;
            return calculateDistance(uCoords.lat, uCoords.lon, a.lat, a.lng) - calculateDistance(uCoords.lat, uCoords.lon, b.lat, b.lng);
        });
        renderAds(filtered, "listings", uCoords);
    }, () => {
        const filtered = getAds().filter(ad => ad.title.toLowerCase().includes(query));
        renderAds(filtered, "listings");
    });
}

function resetFilters() {
    const allActive = getAds().filter(ad => ad.status !== "Sold");
    
    navigator.geolocation.getCurrentPosition((pos) => {
        const uCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        const localAds = allActive.filter(ad => {
            if (ad.lat && ad.lng) {
                return calculateDistance(uCoords.lat, uCoords.lon, ad.lat, ad.lng) <= 75;
            }
            return true; // Show ads without GPS so page isn't empty
        });
        renderAds(localAds, "listings", uCoords);
    }, () => {
        renderAds(allActive, "listings");
    }, { timeout: 3000 });

    const searchInput = document.querySelector('.search-container input');
    if (searchInput) searchInput.value = '';
}

/* --- 5. INITIALIZATION & DELETE --- */
function deleteAd(id) {
    if (confirm("Are you sure you want to delete this ad?")) {
        let allAds = getAds();
        // Fixed: Added the missing filter logic here
        const updatedAds = allAds.filter(ad => String(ad.id) !== String(id));
        saveAds(updatedAds);
        
        if (document.getElementById("myAds")) {
            const userAds = updatedAds.filter(ad => ad.userEmail === currentUser.email);
            renderAds(userAds, "myAds");
        } else {
            resetFilters();
        }
        alert("Ad deleted successfully.");
    }
}

function initMain() {
    if (document.getElementById("listings")) { resetFilters(); }
    const myAdsContainer = document.getElementById("myAds");
    if (myAdsContainer && currentUser) {
        const userAds = getAds().filter(ad => ad.userEmail === currentUser.email);
        renderAds(userAds, "myAds");
    }
}

document.addEventListener("DOMContentLoaded", initMain);







