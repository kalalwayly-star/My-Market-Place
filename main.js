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
        const adDiv = document.createElement('div');
        adDiv.className = 'ad-card';

        const previewImage =
            ad.images && ad.images.length > 0
                ? ad.images[0]
                : ad.image
                ? ad.image
                : 'https://via.placeholder.com/400x300?text=No+Image';

        adDiv.innerHTML = `
           src="data:image/avif;base64,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"

            <div class="ad-card-content">
                <h4 class="ad-title">${ad.title}</h4>
                <p class="ad-description">${ad.description || ''}</p>
                <p class="ad-price"><b>Price: $${ad.price}</b></p>
                <p class="ad-location">📍 ${ad.location || 'Unknown'}</p>

                <button class="view-details-btn" type="button">
                    View Details
                </button>
            </div>
        `;

        // Entire card clickable except buttons
        adDiv.addEventListener('click', function (e) {
            if (!e.target.closest('button')) {
                goToAdDetails(ad.id);
            }
        });

        // View details button
        const detailsBtn = adDiv.querySelector('.view-details-btn');
        if (detailsBtn) {
            detailsBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                goToAdDetails(ad.id);
            });
        }

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
                : 'https://via.placeholder.com/400x300?text=No+Image';

        const adDiv = document.createElement('div');
        adDiv.className = 'ad-card';

        adDiv.innerHTML = `
            <img src="${previewImage}" 
     alt="${ad.title}" 
     style="width:100%; height:180px; object-fit:cover; border-radius:8px; display:block;">

            <div class="ad-card-content">
                <h4 class="ad-title">${ad.title}</h4>
                <p class="ad-description">${ad.description || ''}</p>
                <p class="ad-price"><b>Price: $${ad.price}</b></p>

                <div class="ad-actions">
                    <button class="view-details-btn" type="button">
                        View Details
                    </button>

                    <button class="delete-ad-btn" type="button">
                        Delete
                    </button>
                </div>
            </div>
        `;

        // View details
        const detailsBtn = adDiv.querySelector('.view-details-btn');
        if (detailsBtn) {
            detailsBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                goToAdDetails(ad.id);
            });
        }

        // Delete ad
        const deleteBtn = adDiv.querySelector('.delete-ad-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                deleteAd(ad.id);
            });
        }

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

function applyFilters() {
    const searchText = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const locationText = document.getElementById('locationInput')?.value.toLowerCase() || '';

    const ads = getAdsFromLocalStorage();

    const filteredAds = ads.filter(ad => {
        return (
            (ad.title?.toLowerCase().includes(searchText) ||
             ad.description?.toLowerCase().includes(searchText)) &&
            (ad.location?.toLowerCase().includes(locationText) || !locationText)
        );
    });

    displayAllAds(filteredAds);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('locationInput').value = '';
    displayAllAds();
}

function filterByCategory(category) {
    const ads = getAdsFromLocalStorage();
    const filteredAds = ads.filter(ad => ad.category === category);
    displayAllAds(filteredAds);
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


