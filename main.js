let globalAds = []; // Declare globalAds at the top of the file to avoid the ReferenceError

// Function to check login status using localStorage
function checkLoginStatus() {
    const user = localStorage.getItem('loggedInUser');
    const userEmail = document.getElementById('header-user-email');
    const loginBtn = document.getElementById('userAuth');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfoDiv = document.getElementById('user-info-header');

    if (user) {
        // User is logged in
        if (userEmail) userEmail.innerText = user;
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

// Call this function to update the UI based on login status
checkLoginStatus();

// Logout functionality (using localStorage)
document.getElementById('logout-btn').addEventListener('click', function () {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';  // Redirect to login page
});

// Logout button click event handler
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        // Perform logout actions (if applicable)
        alert("Logged out!");
        window.location.href = "index.html";  // Redirect to home page after logging out
    });
}

// Navigate to ad details page
window.goToDetails = function(id) {
    if (!id) {
        alert("Ad ID is missing");
        return;
    }
    window.location.href = `details.html?id=${id}`;
};

// Function to fetch ads (from localStorage, simulating Firestore data)
function fetchAds() {
    // Simulating fetching ads from local storage (a mock example)
    const storedAds = JSON.parse(localStorage.getItem('marketplace_ads')) || [];
    globalAds = storedAds;
    renderAds(globalAds);
}

// Render Ads to the page (with local storage for images)
function renderAds(adsArray) {
    const container = document.getElementById("listings");

    if (!container) {
        console.error("Error: 'listings' container not found");
        return;
    }

    if (!adsArray || adsArray.length === 0) {
        container.innerHTML = "<p>No ads available</p>";
        return;
    }

    container.innerHTML = adsArray.map(ad => {
        const uniqueId = ad.id;
        const image = Array.isArray(ad.image) ? ad.image[0] : (ad.image || 'https://via.placeholder.com/300');

        // Use local storage for image if available, fallback to placeholder
        const imageBase64 = localStorage.getItem(`adImage_${uniqueId}`);
        const imageSrc = imageBase64 ? imageBase64 : image;

        return `
            <div class="card">
                <div onclick="goToDetails('${uniqueId}')">
                    <img src="${imageSrc}" style="width:50%; height:200px; object-fit:cover;">
                </div>
                <div class="card-content">
                    <h3>${ad.title}</h3>
                    <p>📍 ${ad.location || "No location"}</p>
                    <p><b>$${ad.price}</b></p>
                </div>
            </div>
        `;
    }).join("");
}

// Call fetchAds when the page loads
window.onload = fetchAds;

// Delete ad functionality (Delete from localStorage)
async function deleteAd(adId) {
    if (confirm("Are you sure you want to delete this ad?")) {
        try {
            // Deleting the ad from localStorage
            const ads = JSON.parse(localStorage.getItem('marketplace_ads')) || [];
            const updatedAds = ads.filter(ad => ad.id !== adId);
            localStorage.setItem('marketplace_ads', JSON.stringify(updatedAds));

            alert("Ad deleted successfully!");
            fetchAds();  // Reload the ads after deletion
        } catch (error) {
            console.error("Error deleting ad:", error);
            alert("Error deleting ad.");
        }
    }
}

// Save image to local storage (Base64 encoding)
function saveImageToLocalStorage(imageBase64, adId) {
    localStorage.setItem(`adImage_${adId}`, imageBase64);
}

// Function to upload image and save to local storage (for ad creation or update)
function uploadImageAndSave(imageFile, adId) {
    const reader = new FileReader();
    reader.onloadend = function() {
        const imageBase64 = reader.result;
        saveImageToLocalStorage(imageBase64, adId);
    };
    reader.readAsDataURL(imageFile);
}

// Filter ads by category (simulated with localStorage)
window.filterByCategory = function(category) {
    const filteredAds = (category === 'All') ? globalAds : globalAds.filter(ad => ad.category === category);
    renderAds(filteredAds);
    toggleNoItemsMessage(filteredAds);
};

// Reset filters and show all ads
window.resetFilters = function() {
    renderAds(globalAds);
    toggleNoItemsMessage(globalAds);
};

// Apply filters for search (simulating search functionality)
window.applyFilters = function() {
    const queryText = document.getElementById('searchInput')?.value.toLowerCase().trim();

    const filteredAds = globalAds.filter(ad => ad.title.toLowerCase().includes(queryText));
    renderAds(filteredAds);
    toggleNoItemsMessage(filteredAds);
};

// Toggle the "No Items" message if no ads are found
function toggleNoItemsMessage(ads) {
    const noItemsMessage = document.getElementById('no-items-message');
    if (noItemsMessage) {
        noItemsMessage.style.display = ads.length === 0 ? 'block' : 'none';
    }
}

// Handle category change and show/hide relevant fields
function handleCategoryChange() {
    const categorySelect = document.getElementById("postCategory");
    const commonFields = document.getElementById("commonFields");
    const conditionBox = document.getElementById("globalCondition");
    const carFields = document.getElementById("carFields");

    if (!categorySelect) return;

    const selectedValue = categorySelect.value;

    document.querySelectorAll(".category-details").forEach(sec => sec.style.display = "none");

    if (commonFields) commonFields.style.display = "block";

    const categoryMap = {
        "Cars & Trucks": "section-Cars",
        "Real Estate": "section-RealEstate",
        "Electronics": "section-Electronics",
        "Auto Accessories": "Auto Accessories",
        "Furniture": "section-Furniture",
        "Job": "section-Jobs",
        "Fashion": "section-Fashion",
        "Pets": "section-Pets",
        "Sports": "section-Sports",
        "Books": "section-Books",
        "Appliances": "section-Appliances",
        "Toys": "section-Toys",
        "Services": "section-Services",
        "Garden": "section-Garden",
        "Health": "section-Health",
        "Baby": "section-Baby"
    };

    const sectionId = categoryMap[selectedValue];
    if (sectionId) {
        const el = document.getElementById(sectionId);
        if (el) el.style.display = "block";
    }

    if (carFields) {
        if (selectedValue === "Cars & Trucks") {
            carFields.style.display = "block";
        } else {
            carFields.style.display = "none";
        }
    }

    if (conditionBox) {
        const hideConditionFor = ["Pets", "Jobs", "Real Estate", "Services"];
        conditionBox.style.display = hideConditionFor.includes(selectedValue) ? "none" : "block";
    }
}

document.querySelectorAll('.delete-btn').forEach((button) => {
    button.addEventListener('click', function() {
        const adId = button.dataset.adId;
        deleteAd(adId);
    });
});


    previewContainer.innerHTML = ""; 
});
// Example usage of rendering uploaded images (simulating local image upload)
function renderUploadedImages(images) {
   document.addEventListener("DOMContentLoaded", () => {
    const previewContainer = document.getElementById("galleryPreview");

    if (!previewContainer) {
        console.error("Error: galleryPreview container not found");
        return;
    }

    previewContainer.innerHTML = "";  // Clear existing images

    images.forEach(async (image) => {
        const imageContainer = document.createElement("div");
        imageContainer.classList.add("image-container");
        imageContainer.id = image.id;

        // Fetch image URL from local storage
        const imageUrl = localStorage.getItem(image.url);

        const img = document.createElement("img");
        img.src = imageUrl || 'https://via.placeholder.com/300';  // Fallback to placeholder if no image found
        imageContainer.appendChild(img);

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = function () {
            deleteImage(image.id);
        };
        imageContainer.appendChild(deleteBtn);

        previewContainer.appendChild(imageContainer);
    });
}

// Example usage of uploaded images
const uploadedImages = [
    { id: "image-1", url: "image-1.jpg" },
    { id: "image-2", url: "image-2.jpg" },
    // Add other images
];

renderUploadedImages(uploadedImages);
