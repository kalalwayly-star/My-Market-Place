import { auth, db, storage } from './firebase-config.js'; // Import Firestore and Firebase Storage
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js"; // Firestore functions
import { uploadBytesResumable, getDownloadURL, ref } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js"; // Firebase Storage functions
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js"; // Firebase Auth state listener

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

// Handle image upload and preview
let uploadedImages = [];
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
        const imgContainer = document.createElement("div");
        imgContainer.classList.add("image-container");

        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.style.width = "100px";
        img.style.height = "100px";
        img.style.objectFit = "cover";
        imgContainer.appendChild(img);

        // Add delete icon for each image
        const deleteIcon = document.createElement("span");
        deleteIcon.classList.add("delete-icon");
        deleteIcon.innerHTML = "X";
        deleteIcon.onclick = function () {
            imgContainer.remove();
            const index = uploadedImages.indexOf(file);
            if (index > -1) {
                uploadedImages.splice(index, 1);
            }
        };
        imgContainer.appendChild(deleteIcon);

        // Append to gallery
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
        progressBar.value = progress;
    }, (error) => {
        console.error("Error uploading image:", error);
    }, () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            uploadedImages.push(downloadURL);  // Add image URL to uploadedImages array
            callback();  // Call the callback function once the upload is finished
        });
    });
}

// Handles category change and form section display
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
        carFields.style.display = selectedValue === "Cars & Trucks" ? "block" : "none";
    }

    const hideConditionFor = ["Pets", "Jobs", "Real Estate", "Services"];
    if (conditionBox) {
        conditionBox.style.display = hideConditionFor.includes(selectedValue) ? "none" : "block";
    }
}

// Initialize category change listener
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
    }, 5000); // Increased timeout to 5 seconds

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

// PayPal button display logic
document.addEventListener('DOMContentLoaded', function () {
    const featured5DaysCheckbox = document.getElementById("isFeatured5Days");
    const featured10DaysCheckbox = document.getElementById("isFeatured10Days");
    const paypalButtonContainer = document.getElementById("paypal-button-container");

    function renderPaypalButton(price) {
        if (paypalButtonContainer.innerHTML === "") {
            paypal.Buttons({
                createOrder: function (data, actions) {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: price
                            }
                        }]
                    });
                },
                onApprove: function (data, actions) {
                    return actions.order.capture().then(function (details) {
                        alert("Payment successful! Thank you for featuring your ad.");
                        const featureStartDate = new Date().toISOString();
                        const featureEndDate = new Date(Date.now() + (price === 4.99 ? 5 : 10) * 24 * 60 * 60 * 1000).toISOString();
                        console.log("Feature Start:", featureStartDate, "Feature End:", featureEndDate);
                    });
                },
                onError: function (err) {
                    console.error("PayPal Payment Error", err);
                    alert("There was an error processing your payment. Please try again.");
                }
            }).render(paypalButtonContainer);  // Render PayPal button inside the container
        }
    }

    function togglePaypalButton() {
        if (featured5DaysCheckbox.checked) {
            renderPaypalButton(4.99);
            paypalButtonContainer.style.display = "block";
        } else if (featured10DaysCheckbox.checked) {
            renderPaypalButton(9.99);
            paypalButtonContainer.style.display = "block";
        } else {
            paypalButtonContainer.style.display = "none";
        }
    }

    featured5DaysCheckbox.addEventListener("change", togglePaypalButton);
    featured10DaysCheckbox.addEventListener("change", togglePaypalButton);

    togglePaypalButton();
});
