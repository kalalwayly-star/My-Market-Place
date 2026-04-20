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
function getAds() {
    try {
        // Updated to use the key from your storage.js
        return JSON.parse(localStorage.getItem("ads") || "[]");
    } catch (e) {
        console.error("Error parsing ads:", e);
        return [];
    }
}

// Helper to save ads
function saveAds(adsArray) {
    localStorage.setItem("ads", JSON.stringify(adsArray));
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

/* --- 3. UI RENDERING --- */
function renderAds(adsArray, containerId = "listings") {
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

        let displayImage = 'https://placeholder.com';
        if (ad.image) {
            displayImage = Array.isArray(ad.image) ? ad.image[0] : ad.image;
        }

        return `
            <div class="card ${isFeatured ? 'featured-card' : ''} ${isSold ? 'sold-card' : ''}" 
                 onclick="${isMyAdsPage ? '' : `goToDetails('${ad.id}')`}" 
                 style="cursor:pointer; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; background: white; margin-bottom: 15px; position: relative;">
              
                ${isFeatured ? '<div class="featured-badge" style="position: absolute; top: 10px; left: 10px; background: gold; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; z-index: 10;">✨</div>' : ''}
                ${isSold ? '<div class="sold-badge" style="position: absolute; top: 10px; right: 10px; background: red; color: white; padding: 2px 8px; z-index: 10; font-weight: bold;">SOLD</div>' : ''}

                <div class="card-img-wrapper" style="height:180px; width: 100%; overflow:hidden; background-color: #f0f0f0;">
                    <img src="${displayImage}" alt="${ad.title}" 
                         onerror="this.src='https://placeholder.com'" 
                         style="width:100%; height:100%; object-fit: cover; display: block;">
                </div>
              
                <div class="ad-content" style="padding: 15px;">
                    <span class="category-tag" style="font-size: 0.8rem; color: #666; font-weight: bold; text-transform: uppercase;">${ad.category || "General"}</span>
                    <h3 style="margin: 5px 0;">${ad.title || "Untitled"}</h3>
                    <p style="margin: 5px 0; color: #007bff;"><strong>$${ad.price || "0"}</strong></p>
                  
                    ${isMyAdsPage ? `
                        <div class="actions" style="margin-top:10px; display: flex; gap: 8px;">
                            <button onclick="event.stopPropagation(); toggleStatus('${ad.id}')" class="btn-sm">Status</button>
                            <button onclick="event.stopPropagation(); editAd('${ad.id}')" class="btn-sm">Edit</button>
                            <button onclick="event.stopPropagation(); deleteAd('${ad.id}')" class="btn-sm btn-delete" style="color: red;" data-i18n="delete">Delete</button>
                        </div>
                    ` : ""}
                </div>
            </div>
        `;
    }).join('');
}

/* --- 4. FILTERING LOGIC --- */

// FILTER BY CATEGORY (75km logic)
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
        renderAds(filtered, "listings");
    }, () => {
        // Fallback if GPS blocked
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
    const allAds = getAds();
    const activeAds = allAds.filter(ad => ad.status !== "Sold");
    renderAds(activeAds, "listings");
    document.querySelectorAll('.search-container input').forEach(input => input.value = '');
}

/* --- 5. INITIALIZATION --- */
function initMain() {
    const listingsContainer = document.getElementById("listings");
    if (listingsContainer) {
        resetFilters();
    }

    const myAdsContainer = document.getElementById("myAds");
    if (myAdsContainer) {
        if (!currentUser) {
            myAdsContainer.innerHTML = "<p data-i18n='please_login'>Please login to see your ads.</p>";
        } else {
            const allAds = getAds();
            const userAds = allAds.filter(ad => ad.userEmail === currentUser.email);
            renderAds(userAds, "myAds");
        }
    }
}

document.addEventListener("DOMContentLoaded", initMain);



