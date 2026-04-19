/* --- 1. CONFIGURATION & HELPERS --- */
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

function getAds() {
    return JSON.parse(localStorage.getItem("ads") || "[]");
}

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
        ads = ads.filter(ad => ad.id !== id);
        saveAds(ads);
        location.reload();
    }
}

function toggleStatus(id) {
    let ads = getAds();
    const index = ads.findIndex(ad => ad.id === id);
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
        container.innerHTML = "<p class='no-ads'>No items found.</p>";
        return;
    }

    container.innerHTML = adsArray.map(ad => {
        const isSold = ad.status === 'Sold';
        const isFeatured = ad.isFeatured === true;

        // FIXED: Bulletproof Image Logic
        let displayImage = 'https://via.placeholder.com/300x200?text=No+Image';
        
        if (ad.image) {
            if (Array.isArray(ad.image) && ad.image.length > 0) {
                displayImage = ad.image[0]; 
            } else if (typeof ad.image === 'string' && ad.image.length > 5) {
                displayImage = ad.image; 
            }
        }

        return `
            <div class="card ${isFeatured ? 'featured-card' : ''} ${isSold ? 'sold-card' : ''}" 
                 onclick="${isMyAdsPage ? '' : `goToDetails(${ad.id})`}" 
                 style="cursor:pointer; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; background: white; margin-bottom: 15px; position: relative;">
              
                ${isFeatured ? '<div class="featured-badge" style="position: absolute; top: 10px; left: 10px; background: gold; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; z-index: 10;">✨ FEATURED</div>' : ''}
                ${isSold ? '<div class="sold-badge" style="position: absolute; top: 10px; right: 10px; background: red; color: white; padding: 2px 8px; z-index: 10; font-weight: bold;">SOLD</div>' : ''}

                <div class="card-img-wrapper" style="height:180px; width: 100%; overflow:hidden; background-color: #f0f0f0;">
                    <img src="${displayImage}" alt="${ad.title}" onerror="this.src='https://placeholder.com'" style="width:100%; height:100%; object-fit: cover; display: block;">
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

/* --- 4. INITIALIZATION --- */
function initMain() {
    // 1. Show user email in header if logged in
    const userAuth = document.getElementById("userAuth");
    if (userAuth && currentUser) {
        userAuth.innerHTML = `<span class="user-email">Hi, ${currentUser.email.split('@')[0]}</span>
                             <a href="index.html" class="btn text">Home</a>
                             <a href="post.html" class="btn">Post Ad</a>
                             <button onclick="logout()" class="btn text">Logout</button>`;
    }

    // 2. Render ads for the main listings page
    const listingsContainer = document.getElementById("listings");
    if (listingsContainer) {
        const allAds = getAds();
        const activeAds = allAds.filter(ad => ad.status !== "Sold");
        activeAds.sort((a, b) => (b.isFeatured === a.isFeatured) ? 0 : b.isFeatured ? 1 : -1);
        renderAds(activeAds, "listings");
    }

    // 3. Render ads for the My Ads page
    const myAdsContainer = document.getElementById("myAds");
    if (myAdsContainer) {
        if (!currentUser) {
            myAdsContainer.innerHTML = "<p>Please <a href='login.html'>Login</a> to see your ads.</p>";
        } else {
            const allAds = getAds();
            // Match ads to the current user's email
            const userAds = allAds.filter(ad => ad.userEmail === currentUser.email);
            renderAds(userAds, "myAds");
        }
    }
}

// Run initialization
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMain);
} else {
    initMain();
}

