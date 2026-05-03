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
// Call checkLoginStatus() on page load to refresh the UI
window.onload = function () {
    checkLoginStatus();
};
// Function to get ads from localStorage
function getAdsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('ads')) || [];
}

// --- My Ads Page Specific Code ---

// Display only the logged-in user's ads on the My Ads page
function displayUserAds() {
    const adsContainer = document.getElementById('ads-container');
    const ads = getAdsFromLocalStorage();
    const user = JSON.parse(localStorage.getItem('loggedInUser'));

    if (ads.length === 0) {
        adsContainer.innerHTML = '<p>No ads available. Please add some ads.</p>';
    } else {
        const userAds = ads.filter(ad => ad.userId === user.email);

        if (userAds.length === 0) {
            adsContainer.innerHTML = '<p>No ads found for you.</p>';
        } else {
            adsContainer.innerHTML = ''; // Clear any existing ads

            userAds.forEach(ad => {
                const adDiv = document.createElement('div');
                adDiv.className = 'ad-card';
                adDiv.innerHTML = `
                    <h4>${ad.title}</h4>
                    <p>${ad.description}</p>
                    <p><b>Price: $${ad.price}</b></p>
                    <button class="btn" onclick="viewAdDetails('${ad.id}')">View Details</button>
                    <button class="btn" onclick="deleteAd('${ad.id}')">Delete</button>
                `;
                adsContainer.appendChild(adDiv);
            });
        }
    }
}

// --- Home Page Specific Code (index.html) ---

// Display all ads on the home page
function displayAllAds() {
    const adsContainer = document.getElementById('listings');
    const ads = getAdsFromLocalStorage();

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
                <p><b>Price: $${ad.price}</b></p>
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

// --- Add a New Ad (for Post Ad page, when creating an ad) ---
window.addAd = function () {
    const title = document.getElementById('adTitle').value.trim();
    const description = document.getElementById('adDescription').value.trim();
    const price = document.getElementById('adPrice').value.trim();
    const category = document.getElementById('adCategory').value.trim();
    const user = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!user) {
        alert('You must be logged in to post an ad!');
        return;
    }

    if (!title || !description || !price || !category) {
        alert('Please fill in all fields.');
        return;
    }

    const newAd = {
        id: Date.now().toString(),
        title,
        description,
        price,
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
        window.location.href();  //
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
