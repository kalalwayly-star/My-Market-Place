import { auth, db } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// GLOBAL
let uploadedImages = [];

// TRANSLATION
function runTranslation() {
    if (typeof window.loadLanguage === "function") {
        const savedLang = localStorage.getItem("language") || "en";
        window.loadLanguage(savedLang);
    }
}

// CATEGORY
window.handleCategoryChange = function () {
    const category = document.getElementById('postCategory');
    const common = document.getElementById('commonFields');
    const sections = document.querySelectorAll('.category-details');
    const conditionBox = document.getElementById('globalCondition');

    if (!category) return;

    const val = category.value;

    // Hide all category-specific sections
    sections.forEach(sec => {
        sec.style.display = 'none';
    });

    // Hide the common fields if no category is selected
    if (!val) {
        if (common) common.style.display = 'none';
        if (conditionBox) conditionBox.style.display = 'none';
        return;
    }

    // Show common fields when category is selected
    if (common) common.style.display = 'block';

    // Show specific sections based on category
    if (val === 'Cars & Trucks') {
        document.getElementById('section-Cars')?.style.display = 'block';
    }

    if (val === 'Real Estate') {
        document.getElementById('section-RealEstate')?.style.display = 'block';
    }

    // Hide condition for specific categories
    const noCondition = ['Pets', 'Jobs', 'Real Estate'];
    if (conditionBox) {
        conditionBox.style.display = noCondition.includes(val) ? 'none' : 'block';
    }

    runTranslation();  // Trigger translation if needed
};
// SAVE LOGIC - POST AD
function saveNewAd(event) {
    event.preventDefault();

    console.log("saveNewAd triggered");

    const user = auth.currentUser;

    if (!user) {
        alert("Login required");
        return;
    }

    const category = document.getElementById('postCategory')?.value;

    if (!category) {
        alert("Please select a category");
        return;
    }

    const location = document.getElementById('adLocation')?.value.trim();

    if (!location) {
        alert("Location required");
        return;
    }

    const btn = document.getElementById("postBtn");
    if (btn) {
        btn.disabled = true;
        btn.innerText = "Posting...";
    }

    const condition = document.querySelector('input[name="condition"]:checked')?.value || "";

    const goNext = () => finalizeAd(condition);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                window.currentAdLat = pos.coords.latitude;
                window.currentAdLng = pos.coords.longitude;
                goNext();
            },
            () => goNext(),
            { timeout: 3000 }
        );
    } else {
        goNext();
    }
}

// FINALIZE AD SUBMISSION
function finalizeAd() {
    const user = auth.currentUser;
    const condition = document.querySelector('input[name="condition"]:checked')?.value || "N/A";
    
    const newAd = {
        userId: user.uid,
        userEmail: user.email,
        category: document.getElementById('postCategory').value,
        title: document.getElementById('adTitle').value,
        price: document.getElementById('adPrice').value,
        location: document.getElementById('adLocation').value,
        description: document.getElementById('adDesc').value,
        condition: condition, // Condition value (New or Used)
        image: uploadedImages.length ? uploadedImages : ['https://via.placeholder.com/300'],
        date: new Date().toLocaleDateString(),
        lat: window.currentAdLat || null,
        lng: window.currentAdLng || null
    };

    // Add ad to Firestore
    addDoc(collection(db, "marketplace_ads"), newAd)
        .then(() => {
            alert("Ad posted successfully!");
            window.location.href = "index.html"; // Redirect after posting
        })
        .catch(err => {
            alert("Error: " + err.message);
            console.error(err);
        });
}

// EVENT LISTENERS & INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    runTranslation();

    // Initialize form state on load
    handleCategoryChange();

    // 🔥 IMPORTANT: make category actually react when user changes it
    const category = document.getElementById("postCategory");
    if (category) {
        category.addEventListener("change", handleCategoryChange);
    }

    // Form submit
    const form = document.getElementById("postForm");
    if (form) {
        form.addEventListener("submit", saveNewAd);
    }

    // PayPal / Featured logic
    const featured = document.getElementById("isFeatured");
    const payContainer = document.getElementById("paypal-button-container");
    const postBtn = document.getElementById("postBtn");

    if (featured) {
        featured.addEventListener("change", () => {
            if (featured.checked) {
                initPayPal();
                if (postBtn) postBtn.disabled = true;
            } else {
                if (payContainer) payContainer.style.display = "none";
                if (postBtn) postBtn.disabled = false;
            }
        });
    }
});


// PAYPAL
function initPayPal() {
    const container = document.getElementById("paypal-button-container");
    if (!container || !window.paypal) return;

    container.innerHTML = "";
    container.style.display = "block";

    paypal.Buttons({
        createOrder: (data, actions) => {
            return actions.order.create({
                purchase_units: [{ amount: { value: "4.99" } }]
            });
        },
        onApprove: (data, actions) => {
            return actions.order.capture().then(() => {
                alert("Payment success");
                document.getElementById("postBtn").disabled = false;
            });
        }
    }).render("#paypal-button-container");
}
