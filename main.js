/* --- 1. CONFIGURATION & HELPERS --- */
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// Helper to get ads safely from storage
function getAds() {
    try {
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
    // Uses data-i18n compatible confirm or standard browser confirm
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

/* --- 3. UI RENDERING (The Photo Fix) --- */
function renderAds(adsArray, containerId = "listings") {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";
    const isMyAdsPage = (containerId === "myAds");

    if (!adsArray || adsArray.length === 0) {
        container.innerHTML = `<p class='no-ads' data-i18n="no_items_found">No items found.</p>`;
        return;
    }

    container.innerHTML = adsArray.map(ad => {
        const isSold = ad.status === 'Sold';
        const isFeatured = ad.isFeatured === true;

        // --- FIXED IMAGE LOGIC ---
        let displayImage = 'https://placeholder.com';
        
        if (ad.image) {
            // If image is an array, take the first one; if string, use it directly
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

    // Re-run language update to catch dynamic content (data-i18n)
    if (typeof loadLanguage === "function") {
        const lang = localStorage.getItem("language") || "en";
        // Note: loadLanguage might re-fetch the JSON. Use updateText if available for performance.
    }
}

/* --- 4. INITIALIZATION --- */
function initMain() {
    // 1. Listings Page (index.html)
    const listingsContainer = document.getElementById("listings");
    if (listingsContainer) {
        const allAds = getAds();
        const activeAds = allAds.filter(ad => ad.status !== "Sold");
        activeAds.sort((a, b) => (b.isFeatured === a.isFeatured) ? 0 : b.isFeatured ? 1 : -1);
        renderAds(activeAds, "listings");
    }

    // 2. My Ads Page (myads.html)
    const myAdsContainer = document.getElementById("myAds");
    if (myAdsContainer) {
        if (!currentUser) {
            myAdsContainer.innerHTML = "<p data-i18n='please_login'>Please login to see your ads.</p>";
        } else {
            const allAds = getAds();
            // Filter by userEmail to show only current user's items
            const userAds = allAds.filter(ad => ad.userEmail === currentUser.email);
            renderAds(userAds, "myAds");
        }
    }
}

// Safe execution
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMain);
} else {
    initMain();
}
function filterByCategory(category) {
    const ads = document.querySelectorAll('.ad-card'); // Make sure your ads have this class
    
    ads.forEach(ad => {
        // We get the category stored on the ad element
        const adCategory = ad.getAttribute('data-category');
        
        if (category === 'all' || adCategory === category) {
            ad.style.display = 'block';
        } else {
            ad.style.display = 'none';
        }
    });
}


