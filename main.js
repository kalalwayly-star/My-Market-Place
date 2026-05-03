// --- Common Functions ---

// Function to check login status and update the UI
function checkLoginStatus() {
    const user = localStorage.getItem('loggedInUser');
    const loginBtn = document.getElementById('userAuth');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfoDiv = document.getElementById('user-info-header');
    const userEmail = document.getElementById('header-user-email');

    if (user) {
        // User is logged in
        const parsedUser = JSON.parse(user);
        if (userEmail) userEmail.innerText = parsedUser.email; // Display user email
        if (userInfoDiv) userInfoDiv.style.display = 'block'; // Show user info
        if (loginBtn) loginBtn.style.display = 'none'; // Hide login button
        if (logoutBtn) logoutBtn.style.display = 'inline-block'; // Show logout button
    } else {
        // User is logged out
        if (userInfoDiv) userInfoDiv.style.display = 'none'; // Hide user info
        if (loginBtn) loginBtn.style.display = 'inline-block'; // Show login button
        if (logoutBtn) logoutBtn.style.display = 'none'; // Hide logout button
    }
}

// --- Ads Functions ---

// Function to get ads from localStorage
function getAdsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('ads')) || [];
}

// Display all ads on the home page (index.html)
function displayAllAds() {
    const adsContainer = document.getElementById('ads-container');
    const ads = getAdsFromLocalStorage();

    if (ads.length === 0) {
        adsContainer.innerHTML = '<p>No ads available. Please post some ads.</p>';
    } else {
        ads.forEach(ad => {
            const adDiv = document.createElement('div');
            adDiv.className = 'ad-card';
            adDiv.innerHTML = `
                <h4>${ad.title}</h4>
                <p>${ad.description}</p>
                <p><b>Price: $${ad.price}</b></p>
                <button onclick="goToAdDetails('${ad.id}')">View Details</button>
            `;
            adsContainer.appendChild(adDiv);
        });
    }
}

// Display logged-in user's ads on myads.html
function displayUserAds() {
    const adsContainer = document.getElementById('ads-container');
    const ads = getAdsFromLocalStorage();
    const userRaw = localStorage.getItem('loggedInUser');

    if (!userRaw) {
        alert('Please log in to view your ads.');
        window.location.href = 'login.html'; // Redirect to login page if no user is logged in
        return;
    }

    const user = JSON.parse(userRaw);
    const userAds = ads.filter(ad => ad.userId === user.email); // Filter ads by user email

    if (userAds.length === 0) {
        adsContainer.innerHTML = '<p>No ads posted by you yet.</p>';
    } else {
        userAds.forEach(ad => {
            const adDiv = document.createElement('div');
            adDiv.className = 'ad-card';
            adDiv.innerHTML = `
                <h4>${ad.title}</h4>
                <p>${ad.description}</p>
                <p><b>Price: $${ad.price}</b></p>
                <button onclick="goToAdDetails('${ad.id}')">View Details</button>
            `;
            adsContainer.appendChild(adDiv);
        });
    }
}

// Navigate to ad details page
function goToAdDetails(adId) {
    window.location.href = `ad-details.html?id=${adId}`;  // Pass ad-id in the URL
}

// Add a New Ad (for Post Ad page)
function addAd() {
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
}

// --- Logout Functionality ---

document.getElementById('logout-btn')?.addEventListener('click', function () {
    localStorage.removeItem('loggedInUser');
    checkLoginStatus();  // Update the UI (login/logout state)
    window.location.href = 'index.html'; // Redirect to homepage
});

// --- Page Load Initialization ---

// Ensure proper login status on page load and display ads
window.onload = function () {
    checkLoginStatus(); // Ensure the login status is checked
    if (window.location.pathname.includes('index.html')) {
        displayAllAds(); // Display all ads on the home page
    } else if (window.location.pathname.includes('myads.html')) {
        displayUserAds(); // Display the logged-in user's ads on My Ads page
    }
};

// --- Update Authentication Buttons ---

// Update the authentication buttons based on the login status
function updateAuthButton() {
    const loginButton = document.getElementById('userAuth');
    const logoutButton = document.getElementById('logout-btn');

    const currentUserEmail = localStorage.getItem('currentUserEmail');

    if (currentUserEmail) {
        loginButton.style.display = 'none'; // Hide login button
        logoutButton.style.display = 'inline-block'; // Show logout button
    } else {
        loginButton.style.display = 'inline-block'; // Show login button
        logoutButton.style.display = 'none'; // Hide logout button
    }
}

// Ensure correct auth button display on page load
document.addEventListener("DOMContentLoaded", updateAuthButton);
