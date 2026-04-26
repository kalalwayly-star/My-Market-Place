// Firebase initialization

// Import auth from firebase-config.js
import { auth } from './firebase-config.js';  // Correct import from firebase-config.js

// Import Firebase Authentication method
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
// Assuming db is already initialized and firestore is set up
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// Your function to finalize an ad
async function finalizeAd(adData) {
    try {
        // Reference to Firestore collection
        const adsCollection = collection(db, "marketplace_ads");

        // Add the ad data to Firestore
        const docRef = await addDoc(adsCollection, adData);
        console.log("Ad added with ID:", docRef.id);
    } catch (error) {
        console.error("Error adding ad:", error);
    }
}

// Firebase Auth state listener
onAuthStateChanged(auth, (user) => {
    const loginLink = document.getElementById("loginLink");
    const logoutBtn = document.getElementById("logoutBtn");
    const emailSpan = document.getElementById("emailSpan");

    if (user) {
        // User is logged in
        if (loginLink) loginLink.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        if (emailSpan) emailSpan.innerText = user.email;
    } else {
        // User is logged out
        if (loginLink) loginLink.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "none";
        if (emailSpan) emailSpan.innerText = "";
    }
});

// Global variables for uploaded images
let uploadedImages = [];

// Handles photo upload and preview
window.handlePhotoUpload = function (event) {
    const files = Array.from(event.target.files || []);
    const preview = document.getElementById("galleryPreview");

    if (!preview || !files.length) return;

    // Limit total to 10
    const remainingSlots = 10 - uploadedImages.length;
    const filesToAdd = files.slice(0, remainingSlots);

    filesToAdd.forEach(file => {
        // Preview image
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.style.width = "100px";
        img.style.height = "100px";
        img.style.objectFit = "cover";
        preview.appendChild(img);

        // Convert to base64
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
    });

    // Reset input so same file can be selected again
    event.target.value = "";
};

// Handles category change and form display
window.handleCategoryChange = function () {
    const categorySelect = document.getElementById("postCategory");
    const commonFields = document.getElementById("commonFields");
    const conditionBox = document.getElementById("globalCondition");

    // Safety: If the select isn't found, stop here
    if (!categorySelect) return;

    const selectedValue = categorySelect.value;

    // Hide all extra category sections
    document.querySelectorAll(".category-details").forEach(sec => sec.style.display = "none");

    // Show main fields (Title, Price, Description)
    if (commonFields) commonFields.style.display = "block";

    // Display category-specific sections
    const categoryMap = {
        "Cars & Trucks": "section-Cars",
        "Real Estate": "section-RealEstate",
        "Electronics": "section-Electronics",
        "Furniture": "section-Furniture"
    };

    const sectionId = categoryMap[selectedValue];
    if (sectionId) {
        const el = document.getElementById(sectionId);
        if (el) el.style.display = "block";
    }

    // Show/hide condition box based on category
    const hideConditionFor = ["Pets", "Jobs", "Real Estate", "Services"];
    if (conditionBox) {
        conditionBox.style.display = hideConditionFor.includes(selectedValue) ? "none" : "block";
    }
};

// Handles ad posting
function saveNewAd(event) {
    event.preventDefault();
    const user = auth.currentUser;

    if (!user) {
        alert("Login required");
        return;
    }

    const btn = document.getElementById("postBtn");
    if (btn) {
        btn.disabled = true;
        btn.innerText = "Posting...";
    }

    // Set a timeout for location retrieval
    let locationTimeout = setTimeout(() => {
        console.log("Location timed out, posting anyway...");
        finalizeAd();
    }, 2000);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                clearTimeout(locationTimeout); // Got location, cancel the timeout
                window.currentAdLat = pos.coords.latitude;
                window.currentAdLng = pos.coords.longitude;
                finalizeAd();
            },
            () => {
                clearTimeout(locationTimeout);
                finalizeAd();
            },
            { timeout: 1500 } // Don't wait too long
        );
    } else {
        clearTimeout(locationTimeout);
        finalizeAd();
    }
}

// Finalize ad and post it to Firestore
function finalizeAdupdate() {
    const user = auth.currentUser;

    if (!user) {
        alert("You are not logged in");
        return;
    }

    // Get the form data
    const condition = document.querySelector('input[name="condition"]:checked')?.value || "N/A";

    const newAd = {
        userId: user.uid,
        userEmail: user.email,
        category: document.getElementById("postCategory")?.value || "",
        title: document.getElementById("adTitle")?.value || "",
        price: document.getElementById("adPrice")?.value || "",
        location: document.getElementById("adLocation")?.value || "",
        description: document.getElementById("adDesc")?.value || "",
        condition: condition,
        image: uploadedImages.length ? uploadedImages : ["https://via.placeholder.com/300"],

        date: new Date().toLocaleDateString(),
        lat: window.currentAdLat || null,
        lng: window.currentAdLng || null
    };

    // Save the ad to Firestore
    const adsCollectionRef = collection(db, "marketplace_ads");
    addDoc(adsCollectionRef, newAd)
        .then(() => {
            alert("Ad posted successfully!");
            window.location.href = "index.html";  // Redirect after posting
        })
        .catch(err => {
            console.error("Firestore error:", err);
            alert("Error: " + err.message);
        });
}

// Initialize form events
document.addEventListener("DOMContentLoaded", () => {
    handleCategoryChange(); // Set category change handler

    // Event listener for category change
    document.getElementById("postCategory")
        ?.addEventListener("change", handleCategoryChange);

    // Event listener for photo upload
    document.getElementById("photoInput")
        ?.addEventListener("change", handlePhotoUpload);

    // Event listener for form submission
    document.getElementById("postForm")
        ?.addEventListener("submit", saveNewAd);
});
