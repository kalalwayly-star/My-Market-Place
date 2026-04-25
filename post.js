
import { auth, db, rtdb, ref, onValue } from "./firebase-config.js";

// Then keep your CDN imports below that:
import { onAuthStateChanged, signOut } from "https://gstatic.com";
import { addDoc, collection } from "https://gstatic.com";

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
    const val = document.getElementById("postCategory")?.value;
    const common = document.getElementById("commonFields");
    const conditionBox = document.getElementById("globalCondition");

    // Hide all category-specific sections
    document.querySelectorAll(".category-details").forEach(sec => {
        sec.style.display = "none";
    });

    if (!val) {
        if (common) common.style.display = "none";
        if (conditionBox) conditionBox.style.display = "none";
        return;
    }

    // Always show common fields if a category is picked
    if (common) common.style.display = "block";

    // Show specific category sections
    if (val === "Cars & Trucks") {
        document.getElementById("section-Cars")?.setAttribute("style", "display:block !important");
    } else if (val === "Real Estate") {
        document.getElementById("section-RealEstate")?.setAttribute("style", "display:block !important");
    }

    // Condition visibility logic
    const noCondition = ["Pets", "Jobs", "Real Estate"];
    if (conditionBox) {
        conditionBox.style.display = noCondition.includes(val) ? "none" : "block";
    }

    // Wrap translation in a try-catch so it doesn't break the form
    try {
        runTranslation();
    } catch (e) {
        console.warn("Translation failed, but form should still show.", e);
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
