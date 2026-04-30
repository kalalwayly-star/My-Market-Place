// Import necessary Firebase services that have already been initialized in firebase-config.js
import { auth, db, storage } from './firebase-config.js';  // Import Firestore, Firebase Storage, and Auth
import { collection, getDocs, onSnapshot, query, where, deleteDoc, doc as firestoreDoc, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";  // Firestore imports
import { uploadBytesResumable, getDownloadURL, ref } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js"; // Firebase Storage functions
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";  // Firebase Auth imports
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics.js"; 
import { app } from "./firebase-config.js";

const analytics = getAnalytics(app);
let globalAds = []; // Declare globalAds at the top of the file to avoid the ReferenceError



onAuthStateChanged(auth, (user) => {
    console.log("Auth state changed:", user); // Debugging line

    const loginLink = document.getElementById("userAuth");
    const logoutBtn = document.getElementById("logout-btn");
    const emailSpan = document.getElementById("header-user-email");
    const userInfoDiv = document.getElementById("user-info-header");

    if (user) {
        console.log("User logged in:", user); // Debugging line
        if (userInfoDiv) userInfoDiv.style.display = "block";
        if (emailSpan) emailSpan.innerText = user.email;
        if (loginLink) loginLink.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
    } else {
        console.log("User logged out"); // Debugging line
        if (userInfoDiv) userInfoDiv.style.display = "none";
        if (loginLink) loginLink.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "none";
    }
});

// Logout button click event handler
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            // Successfully logged out
            window.location.href = "index.html";  // Redirect to home page after logging out
        }).catch((error) => {
            // Error during logout
            console.error("Logout error: ", error);
            alert("There was an error logging out. Please try again.");
        });
    });
}

// Navigate to ad details page
window.goToDetails = function(id) {
    console.log("Navigating to details for ad:", id); // Debugging line
    if (!id) {
        alert("Ad ID is missing");
        return;
    }
    window.location.href = `details.html?id=${id}`;
};
// Event listener for category change
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("postCategory")?.addEventListener("change", handleCategoryChange);
    handleCategoryChange(); // Initial call
});
// Fetch Ads from Firestore
function fetchAds() {
    const adsCollectionRef = collection(db, "marketplace_ads");

    getDocs(adsCollectionRef)
        .then(snapshot => {
            if (snapshot.empty) {
                console.log("No ads found"); // Debugging line
            } else {
                console.log("Ads fetched:", snapshot.docs.length); // Debugging line
            }

            globalAds = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,  // Get Firestore document ID
            }));

            console.log("Fetched Ads:", globalAds); // Debugging line to check fetched data
            renderAds(globalAds);
        })
        .catch(error => {
            console.error("Error fetching ads:", error);
            alert("Error fetching ads.");
        });
}

// Render Ads to the page
function renderAds(adsArray) {
    const container = document.getElementById("listings");

    if (!container) {
        console.error("Error: 'listings' container not found");
        return;  // Exit if container is missing
    }

    if (!adsArray || adsArray.length === 0) {
        console.log("No ads to render"); // Debugging line
        container.innerHTML = "<p>No ads available</p>";
        return;
    }

    container.innerHTML = adsArray.map(ad => {
        const uniqueId = ad.id;
        const image = Array.isArray(ad.image) ? ad.image[0] : (ad.image || 'https://via.placeholder.com/300');
        return `
        <div class="card">
            <div onclick="goToDetails('${uniqueId}')">
                <img src="${image}" style="width:50%; height:200px; object-fit:cover;">
            </div>
            <div class="card-content">
                <h3>${ad.title}</h3>
                <p>📍 ${ad.location || "No location"}</p>
                <p><b>$${ad.price}</b></p>
            </div>
        </div>`;
    }).join("");
}

// Call fetchAds when the page loads to display ads
window.onload = fetchAds;  // <-- This will call fetchAds on page load

// Delete ad functionality
async function deleteAd(adId, imageUrls) {
    if (confirm("Are you sure you want to delete this ad?")) {
        try {
            // Deleting associated images from Firebase Storage
            imageUrls.forEach(async (url) => {
                const imageRef = ref(storage, url);  // Get reference to the image in Firebase Storage
                await deleteObject(imageRef);  // Delete the image from Firebase Storage
            });
            
            // Deleting the ad from Firestore
            await deleteDoc(firestoreDoc(db, "marketplace_ads", adId));
            alert("Ad and its images deleted successfully!");
            fetchAds(); // Reload the ads after deletion
        } catch (error) {
            console.error("Error deleting ad:", error);
            alert("Error deleting ad. Check console.");
        }
    }
}

// Filter ads by category
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

// Apply filters for search
window.applyFilters = function() {
    const queryText = document.getElementById('searchInput')?.value.toLowerCase().trim();

    let adsQuery = collection(db, "marketplace_ads");

    // Sanitize query text to prevent regex issues
    function sanitizeQuery(queryText) {
        return queryText.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&'); // Escape special regex characters
    }

    // Apply query if there's search text
    if (queryText) {
        const sanitizedQueryText = sanitizeQuery(queryText);
        adsQuery = query(adsQuery, where("title", "array-contains", sanitizedQueryText));
    }

    // Fetch the results with onSnapshot
    onSnapshot(adsQuery, (snapshot) => {
        globalAds = [];
        snapshot.forEach((doc) => {
            globalAds.push({ ...doc.data(), id: doc.id });
        });
        renderAds(globalAds);  // Render the filtered ads
        toggleNoItemsMessage(globalAds);  // Toggle "No items" message based on the results
    });
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

    // Hide all extra category sections
    document.querySelectorAll(".category-details").forEach(sec => sec.style.display = "none");

    if (commonFields) commonFields.style.display = "block"; // Always show common fields

    const categoryMap = {
        "Cars & Trucks": "section-Cars",
        "Real Estate": "section-RealEstate",
        "Electronics": "section-Electronics",
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

    // Show/hide car-related fields based on category
    if (carFields) {
        if (selectedValue === "Cars & Trucks") {
            carFields.style.display = "block";  // Show car-related fields
        } else {
            carFields.style.display = "none";  // Hide car-related fields for other categories
        }
    }

    // Show/hide condition fields based on category
    const hideConditionFor = ["Pets", "Jobs", "Real Estate", "Services"];
    if (conditionBox) {
        conditionBox.style.display = hideConditionFor.includes(selectedValue) ? "none" : "block"; // Hide condition for specified categories
    }
}

document.querySelectorAll('.delete-btn').forEach((button) => {
    button.addEventListener('click', function() {
        const adId = button.dataset.adId;
        deleteAd(adId);
    });
});

async function deleteAd(adId) {
    const adRef = doc(db, "marketplace_ads", adId);
    await deleteDoc(adRef);
    alert('Ad deleted successfully!');
    fetchAds(); // Reload the ads after deletion
}

// This function will be used to populate the gallery preview
function renderUploadedImages(images) {
    const previewContainer = document.getElementById("galleryPreview");

    // Clear the existing images before re-rendering
    previewContainer.innerHTML = "";

    images.forEach(image => {
        const imageContainer = document.createElement("div");
        imageContainer.classList.add("image-container");
        imageContainer.id = image.id;

        const img = document.createElement("img");
        img.src = image.url;
        imageContainer.appendChild(img);

        // Add delete button
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

// Example usage of rendering uploaded images
const uploadedImages = [
    { id: "image-1", url: "https://example.com/image1.jpg" },
    { id: "image-2", url: "https://example.com/image2.jpg" },
    // Add other images
];

renderUploadedImages(uploadedImages);
