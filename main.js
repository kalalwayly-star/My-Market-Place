// --- Common Functions ---

// Safe localStorage helpers
function getLoggedInUser() {
    try {
        return JSON.parse(localStorage.getItem('loggedInUser')) || null;
    } catch {
        return null;
    }
}

function getAdsFromLocalStorage() {
    try {
        return JSON.parse(localStorage.getItem('ads')) || [];
    } catch {
        return [];
    }
}

function saveAdsToLocalStorage(ads) {
    localStorage.setItem('ads', JSON.stringify(ads));
}

// Function to check login status and update UI
function checkLoginStatus() {
    const user = getLoggedInUser();
    const loginBtn = document.getElementById('userAuth');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfoDiv = document.getElementById('user-info-header');
    const userEmail = document.getElementById('header-user-email');

    if (user) {
        if (userEmail) userEmail.innerText = user.email || '';
        if (userInfoDiv) userInfoDiv.style.display = 'block';
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        if (userInfoDiv) userInfoDiv.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// --- Image Handling ---
function handleImageUpload(fileInput, callback) {
    const file = fileInput?.files?.[0];

    if (!file) {
        callback('');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        callback(e.target.result); // Base64 image data
    };
    reader.readAsDataURL(file);
}

// --- Ads Display Functions ---
function createAdCard(ad) {
    const adDiv = document.createElement('div');
    adDiv.className = 'ad-card';

    adDiv.innerHTML = `
        ${ad.image ? `<img src="${ad.image}" alt="${ad.title}" class="ad-image">` : ''}
        <h4>${ad.title}</h4>
        <p>${ad.description}</p>
        <p><b>Category:</b> ${ad.category}</p>
        <p><b>Price: $${ad.price}</b></p>
        <button onclick="goToAdDetails('${ad.id}')">View Details</button>
    `;

    return adDiv;
}

// Display all ads on homepage
function displayAllAds() {
    const listingsContainer = document.getElementById('listings');
    if (!listingsContainer) return;

    const ads = getAdsFromLocalStorage();
    listingsContainer.innerHTML = '';

    if (ads.length === 0) {
        listingsContainer.innerHTML = '<p>No ads available.</p>';
        return;
    }

    ads.forEach(ad => {
        listingsContainer.appendChild(createAdCard(ad));
    });
}

// Display logged-in user's ads
function displayUserAds() {
    const adsContainer = document.getElementById('ads-container');
    if (!adsContainer) return;

    const user = getLoggedInUser();

    if (!user) {
        alert('Please log in to view your ads.');
        window.location.href = 'login.html';
        return;
    }

    const ads = getAdsFromLocalStorage();
    const userAds = ads.filter(ad => ad.userId === user.email);

    adsContainer.innerHTML = '';

    if (userAds.length === 0) {
        adsContainer.innerHTML = '<p>No ads posted by you yet.</p>';
        return;
    }

    userAds.forEach(ad => {
        adsContainer.appendChild(createAdCard(ad));
    });
}

// Navigate to ad details page
function goToAdDetails(adId) {
    window.location.href = `ad-details.html?id=${adId}`;
}

// --- Add New Ad ---
function addAd() {
    const title = document.getElementById('adTitle')?.value.trim();
    const description = document.getElementById('adDescription')?.value.trim();
    const price = document.getElementById('adPrice')?.value.trim();
    const category = document.getElementById('adCategory')?.value.trim();
    const imageInput = document.getElementById('adImage');

    const user = getLoggedInUser();

    if (!user) {
        alert('You must be logged in to post an ad!');
        return;
    }

    if (!title || !description || !price || !category) {
        alert('Please fill in all fields.');
        return;
    }

    handleImageUpload(imageInput, function(imageData) {
        const newAd = {
            id: Date.now().toString(),
            title,
            description,
            price,
            category,
            image: imageData,
            userId: user.email,
            createdAt: new Date().toISOString()
        };

        const ads = getAdsFromLocalStorage();
        ads.push(newAd);
        saveAdsToLocalStorage(ads);

        alert('Ad posted successfully!');
        window.location.href = 'myads.html';
    });
}

// --- Logout ---
function logout() {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('currentUserEmail');
    checkLoginStatus();
    window.location.href = 'index.html';
}

// --- Authentication Buttons ---
function updateAuthButton() {
    const loginButton = document.getElementById('userAuth');
    const logoutButton = document.getElementById('logout-btn');
    const user = getLoggedInUser();

    if (loginButton) loginButton.style.display = user ? 'none' : 'inline-block';
    if (logoutButton) logoutButton.style.display = user ? 'inline-block' : 'none';
}

// --- Initialize Page ---
document.addEventListener('DOMContentLoaded', function () {
    checkLoginStatus();
    updateAuthButton();

    document.getElementById('logout-btn')?.addEventListener('click', logout);

    const path = window.location.pathname;

    if (path.includes('index.html') || path.endsWith('/')) {
        displayAllAds();
    }

    if (path.includes('myads.html')) {
        displayUserAds();
    }

    document.getElementById('postAdForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        addAd();
    });
});

