import { auth, db, storage } from './firebase-config.js'; // Import Firestore and Firebase Storage
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js"; // Firestore functions
import { uploadBytesResumable, getDownloadURL, ref } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js"; // Firebase Storage functions
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js"; // Firebase Auth state listener
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";



// Firebase Auth state listener
onAuthStateChanged(auth, (user) => {
    const loginLink = document.getElementById("loginLink");
    const logoutBtn = document.getElementById("logoutBtn");
    const emailSpan = document.getElementById("emailSpan");

    if (user) {
        if (loginLink) loginLink.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        if (emailSpan) emailSpan.innerText = user.email;
    } else {
        if (loginLink) loginLink.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "none";
        if (emailSpan) emailSpan.innerText = "";
    }
});

// Initialize an array to store uploaded image URLs
let uploadedImages = [];

// Handles file upload and preview
window.handlePhotoUpload = function (event) {
    const files = Array.from(event.target.files || []);
    const preview = document.getElementById("galleryPreview");

    if (!preview || !files.length) return;

    // Show progress bar
    const progressBar = document.getElementById("progressBar");
    const uploadProgress = document.getElementById("uploadProgress");
    uploadProgress.style.display = "block";

    let uploadedCount = 0;
    const totalFiles = files.length;

    files.forEach((file) => {
        // Create preview image
        const imgContainer = document.createElement("div");
        imgContainer.classList.add("image-container"); // Styling for individual images

        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.style.width = "100px";
        img.style.height = "100px";
        img.style.objectFit = "cover";
        imgContainer.appendChild(img);

        // Create delete icon for each image
        const deleteIcon = document.createElement("span");
        deleteIcon.classList.add("delete-icon");
        deleteIcon.innerHTML = "X";
        deleteIcon.onclick = function () {
            imgContainer.remove(); // Remove image on click
            const index = uploadedImages.indexOf(file);
            if (index > -1) {
                uploadedImages.splice(index, 1); // Remove the deleted image from array
            }
        };
        imgContainer.appendChild(deleteIcon);

        // Append preview to the gallery
        preview.appendChild(imgContainer);

        // Upload image to Firebase Storage
        uploadImageToStorage(file, progressBar, uploadProgress, () => {
            uploadedCount++;
            if (uploadedCount === totalFiles) {
                uploadProgress.style.display = "none";
            }
        });
    });

    // Reset input so the same file can be selected again
    event.target.value = "";
};

// Upload image to Firebase Storage and get the download URL
function uploadImageToStorage(file, progressBar, uploadProgress, callback) {
    const storageRef = ref(storage, 'ads_images/' + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressBar.value = progress;  // Update the progress bar
    }, (error) => {
        console.error("Error uploading image:", error);
    }, () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            uploadedImages.push(downloadURL);  // Add image URL to uploadedImages array
            callback(); // Call the callback function once the upload is finished
        });
    });
}

// Handles category change and form section display
// Ensure handleCategoryChange is declared before we try to use it
function handleCategoryChange() {
    // Get elements
    const categorySelect = document.getElementById("postCategory");
    const commonFields = document.getElementById("commonFields");
    const conditionBox = document.getElementById("globalCondition");
    const carFields = document.getElementById("carFields"); // Div that wraps car fields
    const conditionRadio = document.getElementById("conditionFields"); // Div that wraps condition radio buttons

    if (!categorySelect) return;

    const selectedValue = categorySelect.value;

    // Hide all extra category sections (i.e. other than common fields)
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

    if (carFields) {
        if (selectedValue === "Cars & Trucks") {
            carFields.style.display = "block"; // Show car-related fields
        } else {
            carFields.style.display = "none"; // Hide car-related fields for other categories
        }
    }

    const hideConditionFor = ["Pets", "Jobs", "Real Estate", "Services"];
    if (conditionBox) {
        conditionBox.style.display = hideConditionFor.includes(selectedValue) ? "none" : "block"; // Hide condition for specified categories
    }
}

// Now, use `DOMContentLoaded` to make sure the DOM is ready before binding event listeners
document.addEventListener("DOMContentLoaded", () => {
    const categorySelect = document.getElementById("postCategory");
    if (categorySelect) {
        categorySelect.addEventListener("change", handleCategoryChange); // Add event listener after the DOM is ready
    }
});
document.addEventListener("DOMContentLoaded", () => {
    handleCategoryChange();
    document.getElementById("postCategory")?.addEventListener("change", handleCategoryChange);
    document.getElementById("photoInput")?.addEventListener("change", handlePhotoUpload);
    document.getElementById("postForm")?.addEventListener("submit", saveNewAd);
});




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
// Ensure to use Firebase and PayPal SDKs

// Select the checkbox and PayPal button container
const isFeaturedCheckbox = document.getElementById("isFeatured");
const paypalButtonContainer = document.getElementById("paypal-button-container");

// Add event listener to checkbox to show/hide PayPal button
isFeaturedCheckbox.addEventListener("change", function() {
    if (this.checked) {
        // If checkbox is checked, show PayPal button
        paypalButtonContainer.style.display = "block";
        renderPaypalButton();  // Render the PayPal button when checkbox is checked
    } else {
        // If checkbox is unchecked, hide PayPal button
        paypalButtonContainer.style.display = "none";
    }
});

// Function to render the PayPal button
function renderPaypalButton() {
    // Render the PayPal button only once to prevent duplication
    if (paypalButtonContainer.innerHTML === "") {
        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: "4.99" // Price for featuring the ad
                        }
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    alert("Payment successful! Thank you for featuring your ad.");

                    // Optionally, store payment and feature ad data here
                    const featureStartDate = new Date().toISOString();
                    const featureEndDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(); // 5 days later

                    // Save to Firestore (or your database)
                    const adData = {
                        title: "Featured Ad", // Example ad title
                        price: "$4.99",
                        isFeatured: true,
                        featureStartDate: featureStartDate,
                        featureEndDate: featureEndDate
                    };

                    // Replace `db` with your actual Firebase Firestore reference
                    db.collection("marketplace_ads").add(adData)
                        .then(() => {
                            console.log("Ad has been featured and stored successfully!");
                        })
                        .catch((error) => {
                            console.error("Error adding ad:", error);
                        });
                });
            },
            onError: function(err) {
                console.error("PayPal Payment Error", err);
                alert("There was an error processing your payment. Please try again.");
            }
        }).render(paypalButtonContainer); // Render PayPal button inside the container
    }
}
