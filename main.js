// --- Common Functions ---

// Function to check login status and update the UI
function checkLoginStatus() {
    const user = localStorage.getItem('loggedInUser');
    const userEmail = document.getElementById('header-user-email');
    const loginBtn = document.getElementById('userAuth');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfoDiv = document.getElementById('user-info-header');

    if (user) {
        // User is logged in
        if (userEmail) userEmail.innerText = JSON.parse(user).email; // Display user email
        if (userInfoDiv) userInfoDiv.style.display = 'block';
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        // User is logged out
        if (userInfoDiv) userInfoDiv.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// Function to get ads from localStorage
function getAdsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('ads')) || [];
}

// --- My Ads Page Specific Code ---

// Display only the logged-in user's ads on the My Ads page
function displayUserAds() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) return; // If no user is logged in, exit

    const adsContainer = document.getElementById('ads-container');
    const ads = getAdsFromLocalStorage().filter(ad => ad.userId === user.email); // Filter ads by userId

    if (ads.length === 0) {
        adsContainer.innerHTML = '<p>No ads available. Please add some ads.</p>';
    } else {
        adsContainer.innerHTML = ''; // Clear previous ads

        ads.forEach(ad => {
            const adDiv = document.createElement('div');
            adDiv.className = 'ad-card';
            adDiv.innerHTML = `
                <h4>${ad.title}</h4>
                <p>${ad.description}</p>
                <button class="btn" onclick="deleteAd('${ad.id}')">Delete</button>
            `;
            adsContainer.appendChild(adDiv);
        });
    }
}

// Function to delete an ad from localStorage (on My Ads page)
function deleteAd(adId) {
    let ads = getAdsFromLocalStorage();
    ads = ads.filter(ad => ad.id !== adId);
    localStorage.setItem('ads', JSON.stringify(ads));
    displayUserAds(); // Refresh the display
}

// On page load, display ads for the logged-in user
if (window.location.pathname.includes('myads.html')) {
    window.onload = function() {
        displayUserAds(); // Display the user's own ads
        checkLoginStatus();  // Ensure the login status is checked
    };
}

// --- Home Page Specific Code (index.html) ---

// Display all ads on the home page, with category filtering
function displayAllAds() {
    const adsContainer = document.getElementById('ads-container');
    const ads = getAdsFromLocalStorage();

    if (ads.length === 0) {
        adsContainer.innerHTML = '<p>No ads available.</p>';
    } else {
        adsContainer.innerHTML = ''; // Clear previous ads

        ads.forEach(ad => {
            const adDiv = document.createElement('div');
            adDiv.className = 'ad-card';
            adDiv.innerHTML = `
                <h4>${ad.title}</h4>
                <p>${ad.description}</p>
                <p><b>Category: ${ad.category}</b></p>
                <button class="btn" onclick="goToAdDetails('${ad.id}')">View Details</button>
            `;
            adsContainer.appendChild(adDiv);
        });
    }
}

// Go to Ad Details page (can be implemented later)
function goToAdDetails(adId) {
    window.location.href = `ad-details.html?id=${adId}`;
}

// Filter ads by category
function filterAdsByCategory(category) {
    const adsContainer = document.getElementById('ads-container');
    const ads = getAdsFromLocalStorage();
    const filteredAds = category === 'All' ? ads : ads.filter(ad => ad.category === category);

    if (filteredAds.length === 0) {
        adsContainer.innerHTML = '<p>No ads available in this category.</p>';
    } else {
        adsContainer.innerHTML = ''; // Clear previous ads

        filteredAds.forEach(ad => {
            const adDiv = document.createElement('div');
            adDiv.className = 'ad-card';
            adDiv.innerHTML = `
                <h4>${ad.title}</h4>
                <p>${ad.description}</p>
                <p><b>Category: ${ad.category}</b></p>
                <button class="btn" onclick="goToAdDetails('${ad.id}')">View Details</button>
            `;
            adsContainer.appendChild(adDiv);
        });
    }
}

// On page load, display all ads on the home page
if (window.location.pathname.includes('index.html')) {
    window.onload = function() {
        displayAllAds();  // Display all ads
        checkLoginStatus();  // Ensure the login status is checked
    };
}

// --- Helper Functions ---

// Logout functionality (using localStorage)
if (window.location.pathname.includes('index.html')) {
    document.getElementById('logout-btn')?.addEventListener('click', function () {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';  // Redirect to login page
    });
}

// --- Add a New Ad (for Post Ad page, when creating an ad) ---
window.addAd = function () {
    const title = document.getElementById('adTitle').value.trim();
    const description = document.getElementById('adDescription').value.trim();
    const category = document.getElementById('adCategory').value.trim();
    const user = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!user) {
        alert('You must be logged in to post an ad!');
        return;
    }

    if (!title || !description || !category) {
        alert('Please fill in all fields.');
        return;
    }

    const newAd = {
        id: Date.now().toString(),
        title,
        description,
        category,
        userId: user.email // Associate the ad with the logged-in user
    };

    const ads = getAdsFromLocalStorage();
    ads.push(newAd);
    localStorage.setItem('ads', JSON.stringify(ads));

    window.location.href = 'myads.html'; // Redirect to My Ads page after posting
};
