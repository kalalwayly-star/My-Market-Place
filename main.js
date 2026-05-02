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
// Ensure ads are displayed on the homepage or My Ads page
function displayAds() {
    const adsContainer = document.getElementById('ads-container');
    const ads = JSON.parse(localStorage.getItem('ads')) || [];
    if (ads.length === 0) {
        adsContainer.innerHTML = '<p>No ads available. Please add some ads.</p>';
    } else {
        ads.forEach(ad => {
            const adDiv = document.createElement('div');
            adDiv.className = 'ad-card';
            adDiv.innerHTML = `
                <h4>${ad.title}</h4>
                <p>${ad.description}</p>
                <p><b>Price: $${ad.price}</b></p>
                <button class="btn" onclick="viewAdDetails('${ad.id}')">View Details</button>
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

// --- Home Page Specific Code (index.html) ---



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

  const ads = JSON.parse(localStorage.getItem('ads')) || [];
ads.push(newAd);
localStorage.setItem('ads', JSON.stringify(ads));  // Save ads array

    window.location.href = 'myads.html'; // Redirect to My Ads page after posting
};

// --- Logout functionality ---
if (window.location.pathname.includes('index.html') || window.location.pathname.includes('myads.html')) {
    document.getElementById('logout-btn')?.addEventListener('click', function () {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';  // Redirect to login page
    });
}

// --- On page load, ensure proper login status and display ads ---
window.onload = function() {
    checkLoginStatus();  // Ensure the login status is checked
    if (window.location.pathname.includes('index.html')) {
        displayAllAds(); // Display all ads on the home page
    } else if (window.location.pathname.includes('myads.html')) {
        displayUserAds(); // Display the logged-in user's ads on the My Ads page
    }
};
