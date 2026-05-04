// ------------------------------
// COMMON AUTH FUNCTIONS
// ------------------------------

function checkLoginStatus() {
    const userRaw = localStorage.getItem('loggedInUser');
    const loginBtn = document.getElementById('userAuth');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfoDiv = document.getElementById('user-info-header');
    const userEmail = document.getElementById('header-user-email');

    if (userRaw) {
        const user = JSON.parse(userRaw);

        if (userEmail) userEmail.innerText = user.email;
        if (userInfoDiv) userInfoDiv.style.display = 'block';
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        if (userInfoDiv) userInfoDiv.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('loggedInUser');
    checkLoginStatus();
    window.location.href = 'index.html';
}

document.getElementById('logout-btn')?.addEventListener('click', logout);

// ------------------------------
// ADS STORAGE
// ------------------------------

function getAdsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('ads') || '[]');
}

function saveAdsToLocalStorage(ads) {
    localStorage.setItem('ads', JSON.stringify(ads));
}

// ------------------------------
// HOME PAGE ADS DISPLAY
// ------------------------------

// ------------------------------
// HOME PAGE ADS
// ------------------------------
function displayAllAds(filteredAds = null) {
    const listingsContainer = document.getElementById('listings');
    if (!listingsContainer) return;

    const ads = filteredAds || getAdsFromLocalStorage();
    listingsContainer.innerHTML = '';

    if (ads.length === 0) {
        listingsContainer.innerHTML = '<p>No ads available.</p>';
        return;
    }

    ads.forEach(ad => {
        const previewImage =
            ad.images && ad.images.length > 0
                ? ad.images[0]
                : ad.image
                ? ad.image
                : 'https://via.placeholder.com/400?text=No+Image';

        const adDiv = document.createElement('div');
        adDiv.className = 'ad-card';

        adDiv.innerHTML = `
            <div style="
                display:flex;
                gap:15px;
                align-items:flex-start;
                padding:15px;
            ">
                
                <!-- Square Image -->
                <div style="
                    min-width:180px;
                    width:180px;
                    height:180px;
                    overflow:hidden;
                    border-radius:8px;
                    flex-shrink:0;
                    background:#f4f4f4;
                ">
                    <img src="${previewImage}" 
                         alt="${ad.title}" 
                         style="
                            width:100%;
                            height:100%;
                            object-fit:cover;
                            display:block;
                         ">
                </div>

                <!-- Right Side Content -->
                <div style="flex:1;">
                    <h4 style="margin-top:0; cursor:pointer;">${ad.title}</h4>
                    <p>${ad.description || ''}</p>
                    <p><b>Price: $${ad.price}</b></p>
                    <p>📍 ${ad.location || 'Unknown'}</p>

                    <button class="view-details-btn" type="button">
                        View Details
                    </button>
                </div>
            </div>
        `;

        adDiv.addEventListener('click', function (e) {
            if (!e.target.closest('button')) {
                goToAdDetails(ad.id);
            }
        });

        adDiv.querySelector('.view-details-btn').addEventListener('click', function (e) {
            e.stopPropagation();
            goToAdDetails(ad.id);
        });

        listingsContainer.appendChild(adDiv);
    });
}


// ------------------------------
// MY ADS PAGE
// ------------------------------
function displayUserAds() {
    const adsContainer = document.getElementById('ads-container');
    if (!adsContainer) return;

    const userRaw = localStorage.getItem('loggedInUser');

    if (!userRaw) {
        alert('Please log in first.');
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(userRaw);
    const ads = getAdsFromLocalStorage();

    const userAds = ads.filter(
        ad => ad.userEmail === user.email || ad.userId === user.email
    );

    adsContainer.innerHTML = '';

    if (userAds.length === 0) {
        adsContainer.innerHTML = '<p>No ads posted by you yet.</p>';
        return;
    }

    userAds.forEach(ad => {
        const previewImage =
            ad.images && ad.images.length > 0
                ? ad.images[0]
                : ad.image
                ? ad.image
                : 'https://via.placeholder.com/400?text=No+Image';

        const adDiv = document.createElement('div');
        adDiv.className = 'ad-card';

        adDiv.innerHTML = `
            <div style="
                display:flex;
                gap:15px;
                align-items:flex-start;
                padding:15px;
            ">
                
                <!-- Square Image -->
                <div style="
                    min-width:180px;
                    width:180px;
                    height:180px;
                    overflow:hidden;
                    border-radius:8px;
                    flex-shrink:0;
                    background:#f4f4f4;
                ">
                    <img src="${previewImage}" 
                         alt="${ad.title}" 
                         style="
                            width:100%;
                            height:100%;
                            object-fit:cover;
                            display:block;
                         ">
                </div>

                <!-- Right Side Content -->
                <div style="flex:1;">
                    <h4 style="margin-top:0;">${ad.title}</h4>
                    <p>${ad.description || ''}</p>
                    <p><b>Price: $${ad.price}</b></p>

                    <button type="button" onclick="goToAdDetails('${ad.id}')">
                        View Details
                    </button>

                    <button type="button" onclick="deleteAd('${ad.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `;

        adsContainer.appendChild(adDiv);
    });
}




// ------------------------------
// DETAILS PAGE NAVIGATION
// ------------------------------

function goToAdDetails(adId) {
    if (!adId) {
        alert('Ad ID missing.');
        return;
    }

    window.location.href = `details.html?id=${encodeURIComponent(adId)}`;
}

// ------------------------------
// SEARCH FILTERS
// ------------------------------
// ADVANCED LOCATION SEARCH:
// 1. Show exact city matches first
// 2. If none found, show closest matching cities
// 3. Results ranked by similarity

function applyFilters() {
    const searchText = document.getElementById("searchInput")?.value.toLowerCase().trim() || "";
    const userLocation = document.getElementById("locationInput")?.value.toLowerCase().trim() || "";

    let ads = getAdsFromLocalStorage();

    // First: Filter by keyword
    let keywordFiltered = ads.filter(ad =>
        ad.title?.toLowerCase().includes(searchText) ||
        ad.description?.toLowerCase().includes(searchText) ||
        ad.category?.toLowerCase().includes(searchText)
    );

    // Exact city match first
    let exactCityMatches = keywordFiltered.filter(ad =>
        ad.location && ad.location.toLowerCase() === userLocation
    );

    // If exact matches found
    if (exactCityMatches.length > 0) {
        displayAllAds(exactCityMatches);
        toggleNoItemsMessage(false);
        return;
    }

    // If no exact city, find closest matching cities
    let nearbyMatches = keywordFiltered
        .filter(ad => ad.location)
        .map(ad => {
            return {
                ...ad,
                similarity: calculateLocationSimilarity(userLocation, ad.location.toLowerCase())
            };
        })
        .filter(ad => ad.similarity > 0)
        .sort((a, b) => b.similarity - a.similarity);

    if (nearbyMatches.length > 0) {
        displayAllAds(nearbyMatches);
        toggleNoItemsMessage(false);
        return;
    }

    // No results
    displayAllAds([]);
    toggleNoItemsMessage(true);
}

// Simple similarity scoring
function calculateLocationSimilarity(userCity, adCity) {
    if (!userCity || !adCity) return 0;

    if (adCity.includes(userCity)) return 100;
    if (userCity.includes(adCity)) return 90;

    let score = 0;
    const userWords = userCity.split(" ");
    userWords.forEach(word => {
        if (adCity.includes(word)) score += 20;
    });

    return score;
}

// Show/hide no items
function toggleNoItemsMessage(show) {
    const noItemsMessage = document.getElementById("no-items-message");
    if (noItemsMessage) {
        noItemsMessage.style.display = show ? "block" : "none";
    }
}


// ------------------------------
// PAGE LOAD
// ------------------------------

document.addEventListener('DOMContentLoaded', function () {
    checkLoginStatus();

    const path = window.location.pathname;

    if (path.includes('index.html') || path.endsWith('/')) {
        displayAllAds();
    }

    if (path.includes('myads.html')) {
        displayUserAds();
    }
});


