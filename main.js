/* --- 1. CONFIGURATION & HELPERS --- */

// Get the current user from localStorage
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// Get ads from localStorage
function getAds() {
    return JSON.parse(localStorage.getItem("ads") || "[]");
}

// Save ads to localStorage
function saveAds(adsArray) {
    localStorage.setItem("ads", JSON.stringify(adsArray));
}


/* --- 2. NAVIGATION & AUTH ACTIONS --- */

// Go to ad details page
function goToDetails(id) {
    window.location.href = `details.html?id=${id}`;
}

// Edit ad
function editAd(id) {
    window.location.href = `post.html?id=${id}`;
}

// Delete an ad
function deleteAd(id) {
    if (confirm("Are you sure you want to delete this ad?")) {
        let ads = getAds();  // Get all ads from localStorage
        ads = ads.filter(ad => ad.id !== id);  // Remove the ad with the matching id
        saveAds(ads);  // Save the updated ads list back to localStorage
        location.reload();  // Reload the page to update the UI
    }
}

// Toggle status between Active and Sold
function toggleStatus(id) {
    let ads = getAds();
    const index = ads.findIndex(ad => ad.id === id);
    if (index !== -1) {
        ads[index].status = ads[index].status === "Sold" ? "Active" : "Sold";
        saveAds(ads);
        location.reload();
    }
}

// Logout
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}


/* --- 3. UI RENDERING --- */

// Render ads on the page
function renderAds(adsArray, containerId = "listings") {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";
    const isMyAdsPage = (containerId === "myAds");

    if (!adsArray || adsArray.length === 0) {
        container.innerHTML = "<p class='no-ads'>No items found.</p>";
        return;
    }

    container.innerHTML = adsArray.map(ad => {
        const isSold = ad.status === 'Sold';
        const isFeatured = ad.isFeatured === true;

        // Bulletproof Image Logic
let displayImage = 'https://via.placeholder.com/300x200?text=No+Image';        if (ad && ad.image) {
            if (Array.isArray(ad.image) && ad.image.length > 0) {
                displayImage = ad.image[0];  // Use the first image if it's an array
            } else if (typeof ad.image === 'string' && ad.image.length > 5) {
                displayImage = ad.image;  // Use the image URL or base64 string
            }
        }

        return `
            <div class="card ${isFeatured ? 'featured-card' : ''} ${isSold ? 'sold-card' : ''}"
                onclick="${isMyAdsPage ? '' : `goToDetails(${ad.id})`}"
                style="cursor:pointer; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; background: white; margin-bottom: 15px; position: relative;">
              
                ${isFeatured ? '<div class="featured-badge" style="position: absolute; top: 10px; left: 10px; background: gold; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; z-index: 10;">✨ FEATURED</div>' : ''}
                ${isSold ? '<div class="sold-badge" style="position: absolute; top: 10px; right: 10px; background: red; color: white; padding: 2px 8px; z-index: 10; font-weight: bold;">SOLD</div>' : ''}

                <div class="card-img-wrapper" style="height:180px; width: 100%; overflow:hidden; background-color: #f0f0f0;">
                    <img src="${displayImage}" alt="${ad.title}" style="width:100%; height:100%; object-fit: cover; display: block;">
                </div>
              
                <div class="ad-content" style="padding: 15px;">
                    <span class="category-tag" style="font-size: 0.8rem; color: #666; font-weight: bold; text-transform: uppercase;">${ad.category || "General"}</span>
                    <h3 style="margin: 5px 0;">${ad.title || "Untitled"}</h3>
                    <p style="margin: 5px 0; color: #007bff;"><strong>$${ad.price || "0"}</strong></p>
                    <p style="font-size: 0.9rem; color: #555;">📍 ${ad.location || "Local"}</p>
                  
                    ${isMyAdsPage ? `
                        <div class="actions" style="margin-top:10px; display: flex; gap: 8px;">
                            <button onclick="event.stopPropagation(); toggleStatus(${ad.id})" class="btn-sm" style="cursor:pointer; padding: 5px;">Status</button>
                            <button onclick="event.stopPropagation(); editAd(${ad.id})" class="btn-sm" style="cursor:pointer; padding: 5px;">Edit</button>
                            <button onclick="event.stopPropagation(); deleteAd(${ad.id})" class="btn-sm btn-delete" style="cursor:pointer; padding: 5px; color: red;">Delete</button>
                        </div>
                    ` : ""}
                </div>
            </div>
        `;
    }).join('');
}

// Apply filters based on search and location
function applyFilters() {
    const searchInput = document.getElementById('search');
    const locationInput = document.getElementById('filterLocation');
    if (!searchInput || !locationInput) return;

    const searchQuery = searchInput.value.toLowerCase().trim();
    const locationQuery = locationInput.value.toLowerCase().trim();

    const allAds = JSON.parse(localStorage.getItem("ads") || "[]");

    const filtered = allAds.filter(ad => {
        const adTitle = (ad.title || "").toLowerCase();
        const adLocation = (ad.location || "").toLowerCase();

        const matchesTitle = adTitle.includes(searchQuery);
        const matchesLocation = adLocation.includes(locationQuery);

        return matchesTitle && matchesLocation && ad.status !== "Sold";
    });

    filtered.sort((a, b) => (b.isFeatured === a.isFeatured) ? 0 : b.isFeatured ? 1 : -1);

    const viewTitle = document.getElementById("viewTitle");
    if (viewTitle) {
        viewTitle.innerText = (searchQuery || locationQuery) ? "Search Results" : "Recent Listings";
    }

    renderAds(filtered, "listings");
}

// Filter ads by category
function filterByCategory(categoryName) {
    const allAds = JSON.parse(localStorage.getItem("ads") || "[]");

    const filtered = allAds.filter(ad => {
        const adCat = (ad.category || "").toLowerCase();
        const targetCat = categoryName.toLowerCase();

        if (targetCat === "vehicles") return adCat === "cars & trucks";

        return adCat === targetCat;
    });

    filtered.sort((a, b) => (b.isFeatured === a.isFeatured) ? 0 : b.isFeatured ? 1 : -1);

    const viewTitle = document.getElementById("viewTitle");
    if (viewTitle) viewTitle.innerText = "Category: " + categoryName;

    renderAds(filtered, "listings");
}

// Change language
function changeLanguage(lang) {
    localStorage.setItem("language", lang);
    window.location.reload();
}


/* --- 5. INITIALIZATION --- */

// Update header with user information
function updateHeader() {
    const userAuth = document.getElementById("userAuth");
    if (userAuth && currentUser) {
        userAuth.innerHTML = `<span class="user-email">Hi, ${currentUser.email.split('@')[0]}</span>`;
    }
}

// Initialize main page logic
function initMain() {
    updateHeader();

    if (document.getElementById("listings")) {
        const allAds = getAds();
        const activeAds = allAds.filter(ad => ad.status !== "Sold");
        activeAds.sort((a, b) => (b.isFeatured === a.isFeatured) ? 0 : b.isFeatured ? 1 : -1);
        renderAds(activeAds, "listings");
    }

    if (document.getElementById("myAds")) {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));

        if (!currentUser) {
            document.getElementById("myAds").innerHTML =
                "<p>Please <a href='login.html'>Login</a> to see your ads.</p>";
        } else {
            const userAds = getAds().filter(ad => ad.userEmail === currentUser.email);
            renderAds(userAds, "myAds");
        }
    }
}

// Run safely after DOM loads
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMain);
} else {
    initMain();
}

// Check admin access
function checkAdminAccess() {
    const isAdmin = localStorage.getItem("isAdmin");

    if (isAdmin !== "true") {
        alert("Access Denied");
        window.location.href = "index.html";
    } else {
        window.location.href = "admin.html";
    }
}
