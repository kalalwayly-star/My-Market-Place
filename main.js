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

// Helper to get ads safely from storage
// Helper to get ads safely from storage
function getAds() {
    try {
        // Updated to match storage.js key
        return JSON.parse(localStorage.getItem("marketplace_ads") || "[]");
    } catch (e) {
        console.error("Error parsing ads:", e);
        return [];
    }
}

// Helper to save ads
function saveAds(adsArray) {
    // Updated to match storage.js key
    localStorage.setItem("marketplace_ads", JSON.stringify(adsArray));
}


/* --- 2. NAVIGATION & AUTH ACTIONS --- */
function goToDetails(id) {
    window.location.href = `details.html?id=${id}`;
}

function editAd(id) {
    window.location.href = `post.html?id=${id}`;
}

function deleteAd(id) {
    if (confirm("Are you sure you want to delete this ad?")) {
        let ads = getAds();
        ads = ads.filter(ad => String(ad.id) !== String(id));
        saveAds(ads);
        location.reload();
    }
}

function toggleStatus(id) {
    let ads = getAds();
    const index = ads.findIndex(ad => String(ad.id) === String(id));
    if (index !== -1) {
        ads[index].status = ads[index].status === "Sold" ? "Active" : "Sold";
        saveAds(ads);
        location.reload();
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}
/* --- UPDATED UI RENDERING WITH DISTANCE --- */
/* --- FIXED UI RENDERING --- */
function renderAds(adsArray, containerId = "listings", userCoords = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";
    const isMyAdsPage = (containerId === "myAds");

    if (!adsArray || adsArray.length === 0) {
        container.innerHTML = `<p class='no-ads' data-i18n="no_items_found" style="text-align:center; width:100%;">No items found.</p>`;
        return;
    }

    container.innerHTML = adsArray.map(ad => {
        const isSold = ad.status === 'Sold';
        const isFeatured = ad.isFeatured === true;

        // --- FIX: Define 'dist' before using it ---
        let distanceHTML = "";
        if (userCoords && ad.lat && ad.lng) {
            const dist = calculateDistance(userCoords.lat, userCoords.lon, ad.lat, ad.lng);
            distanceHTML = `<span class="distance-tag" style="font-size: 0.75rem; color: #28a745; margin-left: 10px;">📍 ${dist.toFixed(1)} <span data-i18n="km">km</span></span>`;
        }

        let displayImage = 'https://placeholder.com';
        if (ad.image) {
            displayImage = Array.isArray(ad.image) ? ad.image[0] : ad.image;
        }

        return `
            <div class="card ${isFeatured ? 'featured-card' : ''} ${isSold ? 'sold-card' : ''}" 
                 onclick="${isMyAdsPage ? '' : `goToDetails('${ad.id}')`}" 
                 style="cursor:pointer; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; background: white; margin-bottom: 15px; position: relative;">
                <div class="card-img-wrapper" style="height:180px; width: 100%; overflow:hidden; background-color: #f0f0f0;">
                    <img src="${displayImage}" alt="${ad.title}" onerror="this.src='https://placeholder.com'" style="width:100%; height:100%; object-fit: cover;">
                </div>
                <div class="ad-content" style="padding: 15px;">
                    <div style="display:flex; justify-content: space-between; align-items: center;">
                        <span class="category-tag" style="font-size: 0.8rem; color: #666; font-weight: bold;">${ad.category || "General"}</span>
                        ${distanceHTML}
                    </div>
                    <h3>${ad.title || "Untitled"}</h3>
                    <p style="color: #007bff;"><strong>$${ad.price || "0"}</strong></p>
                </div>
            </div>
        `;
    }).join('');
}


/* --- UPDATED CATEGORY FILTER --- */
function filterByCategory(category) {
    navigator.geolocation.getCurrentPosition((position) => {
        const uLat = position.coords.latitude;
        const uLon = position.coords.longitude;

        const allAds = getAds();
        const filtered = allAds.filter(ad => {
            const matchesCat = ad.category === category;
            if (ad.lat && ad.lng) {
                const dist = calculateDistance(uLat, uLon, ad.lat, ad.lng);
                return matchesCat && dist <= 75;
            }
            return matchesCat;
        });

        // Pass user coordinates to show distances in the card
        renderAds(filtered, "listings", { lat: uLat, lon: uLon });
    }, () => {
        const allAds = getAds();
        renderAds(allAds.filter(ad => ad.category === category), "listings");
    });
}



// SEARCH BUTTON
function applyFilters() {
    const searchTerm = document.querySelector('[data-i18n-placeholder="search_placeholder"]').value.toLowerCase();
    const locationTerm = document.querySelector('[data-i18n-placeholder="location_placeholder"]').value.toLowerCase();
    
    const allAds = getAds();
    const filtered = allAds.filter(ad => {
        const matchesSearch = ad.title.toLowerCase().includes(searchTerm) || (ad.description && ad.description.toLowerCase().includes(searchTerm));
        const matchesLocation = ad.location && ad.location.toLowerCase().includes(locationTerm);
        return matchesSearch && matchesLocation;
    });
    renderAds(filtered, "listings");
}

// VIEW ALL
function resetFilters() {
    navigator.geolocation.getCurrentPosition((position) => {
        const uLat = position.coords.latitude;
        const uLon = position.coords.longitude;
        const activeAds = getAds().filter(ad => ad.status !== "Sold");
        renderAds(activeAds, "listings", { lat: uLat, lon: uLon });
    }, () => {
        const activeAds = getAds().filter(ad => ad.status !== "Sold");
        renderAds(activeAds, "listings");
    });

    document.querySelectorAll('.search-container input').forEach(input => input.value = '');
}


/* --- 5. INITIALIZATION --- */

    const myAdsContainer = document.getElementById("myAds");
    if (myAdsContainer) {
        if (!currentUser) {
            myAdsContainer.innerHTML = "<p data-i18n='please_login'>Please login to see your ads.</p>";
        } else {
            const allAds = getAds();
            const userAds = allAds.filter(ad => ad.userEmail === currentUser.email);
            renderAds(userAds, "myAds", null);
        }
    }
}

document.addEventListener("DOMContentLoaded", initMain);



