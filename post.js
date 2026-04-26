// Import necessary Firebase SDKs and services
import { auth, db, storage } from './firebase-config.js'; // Importing Firestore and Firebase Storage
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js"; // Firestore functions
import { uploadBytesResumable, getDownloadURL, ref } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js"; // Firebase Storage functions
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js"; // Firebase Auth state listener

let uploadedImages = []; // Global variable for storing image URLs

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
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.style.width = "100px";
        img.style.height = "100px";
        img.style.objectFit = "cover";
        preview.appendChild(img);

        // Upload image to Firebase Storage
        uploadImageToStorage(file);
    });

    event.target.value = ""; // Reset input
};

// Upload image to Firebase Storage and get the download URL
function uploadImageToStorage(file) {
    const storageRef = ref(storage, 'ads_images/' + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
    }, (error) => {
        console.error("Error uploading image:", error);
    }, () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            uploadedImages.push(downloadURL);  // Add image URL to uploadedImages array
        });
    });
}

// Handles category change and form section display
window.handleCategoryChange = function () {
    const categorySelect = document.getElementById("postCategory");
    const commonFields = document.getElementById("commonFields");
    const conditionBox = document.getElementById("globalCondition");

    if (!categorySelect) return;

    const selectedValue = categorySelect.value;

    document.querySelectorAll(".category-details").forEach(sec => sec.style.display = "none");

    if (commonFields) commonFields.style.display = "block";

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
        alert("Login required");
        return;
    }

    const btn = document.getElementById("postBtn");
    if (btn) {
        btn.disabled = true;
        btn.innerText = "Posting...";
    }

    let locationTimeout = setTimeout(() => {
        console.log("Location timed out, posting anyway...");
        finalizeAd();
    }, 5000);  // Increased timeout to 5 seconds

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                clearTimeout(locationTimeout);
                window.currentAdLat = pos.coords.latitude;
                window.currentAdLng = pos.coords.longitude;
                finalizeAd();
            },
            () => {
                clearTimeout(locationTimeout);
                finalizeAd();
            },
            { timeout: 5000 }
        );
    } else {
        clearTimeout(locationTimeout);
        finalizeAd();
    }
}

// Finalize ad and post it to Firestore
function finalizeAd() {
    const user = auth.currentUser;

    if (!user) {
        alert("You are not logged in");
        return;
    }

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

// Event listeners for category changes and form submission
document.addEventListener("DOMContentLoaded", () => {
    handleCategoryChange();
    document.getElementById("postCategory")?.addEventListener("change", handleCategoryChange);
    document.getElementById("photoInput")?.addEventListener("change", handlePhotoUpload);
    document.getElementById("postForm")?.addEventListener("submit", saveNewAd);
});
