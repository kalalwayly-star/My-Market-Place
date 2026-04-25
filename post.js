// 1. Local config
import { auth, db } from "./firebase-config.js";/firebasejs/12.12.1/firebase-firestore.js 

// 2. FULL CDN PATHS (This fixes the CORS error)
import { onAuthStateChanged } from "https://gstatic.com";/firebasejs/12.12.1/firebase-firestore.js 
import { addDoc, collection } from "https://gstatic.com";/firebasejs/12.12.1/firebase-firestore.js 

// ALWAYS THIRD: Your page logic
document.addEventListener("DOMContentLoaded", () => {
    const loginLink = document.getElementById("userAuth");
    const logoutBtn = document.getElementById("logout-btn");
    const emailSpan = document.getElementById("header-user-email");

    onAuthStateChanged(auth, (user) => {
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
});





/* =======================
   GLOBAL
======================= */
let uploadedImages = [];  // Stores uploaded images

/* =======================
   PHOTO UPLOAD HANDLER
======================= */
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

/* =======================
   TRANSLATION HANDLER
======================= */
function runTranslation() {
    if (typeof window.loadLanguage === "function") {
        const savedLang = localStorage.getItem("language") || "en";
        window.loadLanguage(savedLang);
    }
}

/* =======================
   CATEGORY HANDLER
======================= */
window.handleCategoryChange = function () {
    const categorySelect = document.getElementById("postCategory");
    const commonFields = document.getElementById("commonFields");
    const conditionBox = document.getElementById("globalCondition");

    // Safety: If the select isn't found, stop here
    if (!categorySelect) return;

    const selectedValue = categorySelect.value;
    console.log("Category selected:", selectedValue); // Debug check

    // 1. Hide ALL extra category sections first
    document.querySelectorAll(".category-details").forEach(sec => {
        sec.style.display = "none";
    });

    // 2. If nothing is selected, hide main fields and condition box
    if (!selectedValue) {
        if (commonFields) commonFields.style.display = "none";
        if (conditionBox) conditionBox.style.display = "none";
        return;
    }

    // 3. SHOW the main fields (Title, Price, Description)
    if (commonFields) {
        commonFields.style.display = "block";
    }

    // 4. Show specific sections (Update these IDs to match your HTML exactly)
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

    // 5. Condition Box Logic (Hide for specific categories)
    const hideConditionFor = ["Pets", "Jobs", "Real Estate", "Services"];
    if (conditionBox) {
        conditionBox.style.display = hideConditionFor.includes(selectedValue) ? "none" : "block";
    }

    // 6. Refresh Translations
    // Note: We use window.loadLanguage to ensure it's accessible from this module
    if (typeof window.loadLanguage === "function") {
        const savedLang = localStorage.getItem("language") || "en";
        window.loadLanguage(savedLang);
    }
};




/* =======================
   POST AD HANDLER
======================= */
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

    // Set a timeout: if location takes more than 2 seconds, just post without it
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

/* =======================
   FINALIZE AD HANDLER (POST AD TO FIRESTORE)
======================= */
// FINALIZE AD HANDLER (POST AD TO FIRESTORE)
function finalizeAd() {
    const user = auth.currentUser;

    if (!user) {
        alert("You are not logged in");
        return;
    }

    // ✅ correct condition selector
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

        // ⚠️ keep this for now (but may cause size issues)
        image: uploadedImages.length ? uploadedImages : ["https://via.placeholder.com/300"],

        date: new Date().toLocaleDateString(),
        lat: window.currentAdLat || null,
        lng: window.currentAdLng || null
    };


    // Corrected: Get a reference to the collection and add the document
    const adsCollectionRef = collection(db, "marketplace_ads");  // Correct reference
    addDoc(adsCollectionRef, newAd)  // Correct use of addDoc with collection reference
        .then(() => {
            alert("Ad posted successfully!");
            window.location.href = "index.html";  // Redirect after posting
        })
        .catch(err => {
            console.error("Firestore error:", err);
            alert("Error: " + err.message);
        });
}

/* =======================
   INITIALIZATION HANDLER
======================= */
document.addEventListener("DOMContentLoaded", () => {
    runTranslation();  // Load translations
    handleCategoryChange();  // Set category change handler

    // Event listener for category change
    document.getElementById("postCategory")
        ?.addEventListener("change", handleCategoryChange);

    // Event listener for photo upload
    document.getElementById("photoInput")
        ?.addEventListener("change", handlePhotoUpload);

    // Event listener for form submission
    document.getElementById("postForm")
        ?.addEventListener("submit", saveNewAd);

    // PayPal integration for featured ad
    const featured = document.getElementById("isFeatured");
    const btn = document.getElementById("postBtn");

    featured?.addEventListener("change", () => {
        if (featured.checked) {
            initPayPal();
            if (btn) btn.disabled = true;
        } else {
            document.getElementById("paypal-button-container").style.display = "none";
            if (btn) btn.disabled = false;
        }
    });
});

/* =======================
   PAYPAL INTEGRATION
======================= */
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
