// Import necessary Firebase SDKs and services
import { auth, db } from './firebase-config.js'; // Importing Firestore and Auth
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js"; // Firestore functions
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js"; // Auth state listener

// Global variable for uploaded images
let uploadedImages = [];

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

// Handles photo upload and preview
window.handlePhotoUpload = function (event) {
    const files = Array.from(event.target.files || []);
    const preview = document.getElementById("galleryPreview");

    if (!preview || !files.length) return;

    // Limit to 10 images
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

        // Convert image to base64 and store it
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
    });

    // Reset input so the same file can be selected again
    event.target.value = "";
};

// Handles category change and form section display
window.handleCategoryChange = function () {
    const categorySelect = document.getElementById("postCategory");
    const commonFields = document.getElementById("commonFields");
    const conditionBox = document.getElementById("globalCondition");

    if (!categorySelect) return;

    const selectedValue = categorySelect.value;

    // Hide all extra category sections
    document.querySelectorAll(".category-details").forEach(sec => sec.style.display = "none");

    // Show main fields (Title, Price, Description)
    if (commonFields) commonFields.style.display = "block";

    // Show specific section based on selected category
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

    // Hide/show condition box based on category
    const hideConditionFor = ["Pets", "Jobs", "Real Estate", "Services"];
    if (conditionBox) {
        conditionBox.style.display = hideConditionFor.includes(selectedValue) ? "none" : "block";
    }
};

// Handles ad posting when the submit button is clicked
function saveNewAd(event) {
    event.preventDefault();
    const user = auth.currentUser;

    if (!user) {
        alert("You need to log in to post an ad.");
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
                clearTimeout(locationTimeout); // Got location, cancel timeout
                window.currentAdLat = pos.coords.latitude;
                window.currentAdLng = pos.coords.longitude;
                finalizeAd();
            },
            () => {
                clearTimeout(locationTimeout);
                finalizeAd();
            },
            { timeout: 1500 }
        );
    } else {
        clearTimeout(locationTimeout);
        finalizeAd();
    }
}

// Function to finalize and post the ad to Firestore
async function finalizeAd() {
    const user = auth.currentUser;

    if (!user) {
        alert("You are not logged in.");
        return;
    }

    // Get form data
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

    // Post the ad to Firestore
    const adsCollectionRef = collection(db, "marketplace_ads");
    try {
        const docRef = await addDoc(adsCollectionRef, newAd);
        alert("Ad posted successfully!");
        window.location.href = "index.html"; // Redirect to home after posting
    } catch (err) {
        console.error("Firestore error:", err);
        alert("Error posting ad: " + err.message);
    }
}

// Initialize form events on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    handleCategoryChange(); // Set category change handler

    // Event listeners for form submission and category changes
    document.getElementById("postCategory")?.addEventListener("change", handleCategoryChange);
    document.getElementById("photoInput")?.addEventListener("change", handlePhotoUpload);
    document.getElementById("postForm")?.addEventListener("submit", saveNewAd);
});

