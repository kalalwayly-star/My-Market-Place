import { auth, db } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// GLOBAL VARIABLES
let uploadedImages = [];

// Helper to trigger your translation
function runTranslation() {
    if (typeof window.loadLanguage === "function") {
        const savedLang = localStorage.getItem("language") || "en";
        window.loadLanguage(savedLang);
    }
}

// Handle Category Changes
window.handleCategoryChange = function () {
    const mainCategorySelect = document.getElementById('postCategory');
    const commonFields = document.getElementById('commonFields');
    const sections = document.querySelectorAll('.category-details');
    const condSec = document.getElementById('globalCondition');

    if (!mainCategorySelect) return;

    const categoryValue = mainCategorySelect.value;

    // Hide all sections first
    sections.forEach(sec => sec.style.display = 'none');

    if (categoryValue === "") {
        if (commonFields) commonFields.style.display = 'none';
        if (condSec) condSec.style.display = 'none';
        return;
    }

    // Show shared fields
    if (commonFields) commonFields.style.display = 'block';

    // Handle specific categories
    const carSec = document.getElementById('section-Cars');
    if (categoryValue === 'Cars & Trucks' && carSec) carSec.style.display = 'block';

    const reSec = document.getElementById('section-RealEstate');
    if (categoryValue === 'Real Estate' && reSec) reSec.style.display = 'block';

    // Hide or show condition field
    const noCondition = ['Pets', 'Jobs', 'Real Estate'];
    if (condSec) {
        condSec.style.display = noCondition.includes(categoryValue) ? 'none' : 'block';
    }

    // Re-translate the newly visible fields
    runTranslation();
};

// Photo Upload and Compression
async function handlePhotoUpload(event) {
    const gallery = document.getElementById('galleryPreview');
    const files = Array.from(event.target.files);
    if (!gallery) return;

    if (uploadedImages.length + files.length > 10) {
        alert("Max 10 photos.");
        return;
    }

    for (const file of files) {
        try {
            const base64 = await compressImage(file);
            uploadedImages.push(base64);
            const div = document.createElement('div');
            div.style.cssText = "position:relative; width:80px; height:80px; display:inline-block; margin:5px;";
            div.innerHTML = `
                <img src="${base64}" style="width:100%; height:100%; object-fit:cover; border-radius:5px;">
                <button type="button" onclick="removeImg(event, '${base64}', this)" 
                    style="position:absolute; top:-5px; right:-5px; background:red; color:white; border:none; border-radius:50%; cursor:pointer; width:20px; height:20px; line-height:15px;">×</button>
            `;
            gallery.appendChild(div);
        } catch (e) {
            console.error(e);
        }
    }
}

function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height, MAX = 800;
                if (w > h && w > MAX) { h *= MAX / w; w = MAX; }
                else if (h > MAX) { w *= MAX / h; h = MAX; }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
        };
    });
}

function removeImg(e, data, btn) {
    if (e) e.stopPropagation();
    uploadedImages = uploadedImages.filter(img => img !== data);
    btn.parentElement.remove();
}

// Save Logic - Posts the new ad to Firebase
function saveNewAd(event) {
    event.preventDefault();

    console.log("saveNewAd function triggered");

    const user = auth.currentUser;

    // Check if the user is logged in
    if (!user) {
        alert("You must be logged in to post ads.");
        console.log("User is not logged in.");
        return;
    }

    console.log("User is logged in:", user.email);

    const locVal = document.getElementById('adLocation').value.trim();

    // Validate location field
    if (!locVal) {
        alert("Location required.");
        console.log("Location field is empty");
        return;
    }

    console.log("Location provided:", locVal);

 


    // Assuming you want to get geolocation data before posting the ad
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                window.currentAdLat = pos.coords.latitude;
                window.currentAdLng = pos.coords.longitude;
                console.log("Geolocation retrieved:", window.currentAdLat, window.currentAdLng);
                finalizeAd(condition, false);  // Proceed after geolocation retrieval
            },
            (error) => {
                console.warn("Geolocation failed:", error.message);
                finalizeAd(condition, false);  // Proceed even if geolocation fails
            },
            { timeout: 3000 }
        );
    } else {
        console.warn("Geolocation not supported or denied.");
        finalizeAd(condition, false);  // Proceed if geolocation is not available
    }
}

// Finalize Ad Submission (save to Firestore)
function finalizeAd(condition, featuredStatus) {
    const user = auth.currentUser;
const conditionEl = document.querySelector('input[name="condition"]:checked');

    if (!user) {
        alert("You must be logged in to post ads.");
        return;
    }

    const categoryEl = document.getElementById('postCategory');
    const titleEl = document.getElementById('adTitle');
    const priceEl = document.getElementById('adPrice');
    const locationEl = document.getElementById('adLocation');
    const descEl = document.getElementById('adDesc');

    if (!categoryEl || !titleEl || !priceEl || !locationEl || !descEl) {
        alert("Form fields missing in HTML!");
        return;
    }

    const newAd = {
        id: Date.now(),
        userId: user.uid,
        userEmail: user.email,
        category: categoryEl.value,
        title: titleEl.value,
        price: priceEl.value,
        location: locationEl.value,
        description: descEl.value,
        condition: condition,
        image: (uploadedImages.length > 0) ? uploadedImages : ['https://via.placeholder.com/300'],
        status: "Active",
        date: new Date().toLocaleDateString(),
        lat: window.currentAdLat || null,
        lng: window.currentAdLng || null
    };

    addDoc(collection(db, "marketplace_ads"), newAd)
        .then(() => {
            alert("Ad posted successfully!");
            window.location.href = "index.html";  // Redirect after posting
        })
        .catch(err => {
            alert("Error: " + err.message);
            console.error(err);
        });
}

// Initialize and Attach Functions to Window
window.handleCategoryChange = handleCategoryChange;
window.handlePhotoUpload = handlePhotoUpload;
window.saveNewAd = saveNewAd;
window.removeImg = removeImg;

document.addEventListener('DOMContentLoaded', () => {
    handleCategoryChange();  // Initialize category sections
    runTranslation();  // Handle translations if any
});

// PayPal integration
function initPayPal() {
    const container = document.getElementById("paypal-button-container");

    if (!container || !window.paypal) return;

    container.innerHTML = "";
    container.style.display = "block";

    paypal.Buttons({
        createOrder: (data, actions) => {
            return actions.order.create({
                purchase_units: [{
                    amount: { value: "4.99" }
                }]
            });
        },

        onApprove: (data, actions) => {
            return actions.order.capture().then(() => {
                alert("Payment successful ✔");
                document.getElementById("postBtn").disabled = false;
            });
        },

        onError: (err) => {
            console.error(err);
            alert("Payment failed");
        }
    }).render("#paypal-button-container");
}

window.initPayPal = initPayPal;

document.addEventListener("DOMContentLoaded", () => {
    const featured = document.getElementById("isFeatured");
    const payContainer = document.getElementById("paypal-button-container");
    const postBtn = document.getElementById("postBtn");

    if (postBtn) {
        postBtn.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default form submission
            saveNewAd(event);       // Trigger the ad-saving function
        });
    }

    if (featured) {
        featured.addEventListener("change", function () {
            if (this.checked) {
                initPayPal();  // Initialize PayPal if checkbox is checked
                if (postBtn) postBtn.disabled = true;  // Disable the button
            } else {
                if (payContainer) payContainer.style.display = "none"; // Hide PayPal button
                if (postBtn) postBtn.disabled = false;  // Enable the button
            }
        });
    }
});
