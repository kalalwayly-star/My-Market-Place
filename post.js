import { auth } from "./firebase-config.js";  // For Firebase Authentication
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js"; // Authentication functions
import { db, ref, onValue } from "./firebase-config.js";  // For Firebase Realtime Database functions

/* =======================
   GLOBAL
======================= */
let uploadedImages = [];

/* =======================
   PHOTO UPLOAD
======================= */
window.handlePhotoUpload = function (event) {
    const files = Array.from(event.target.files || []);
    const preview = document.getElementById("galleryPreview");

    if (!preview || !files.length) return;

    // limit total to 10
    const remainingSlots = 10 - uploadedImages.length;
    const filesToAdd = files.slice(0, remainingSlots);

    filesToAdd.forEach(file => {
        // preview
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.style.width = "100px";
        img.style.height = "100px";
        img.style.objectFit = "cover";
        preview.appendChild(img);

        // convert to base64
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
    });

    // reset input so same file can be selected again
    event.target.value = "";
};

/* =======================
   TRANSLATION
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
    const category = document.getElementById("postCategory");
    const common = document.getElementById("commonFields");
    const conditionBox = document.getElementById("globalCondition");

    if (!category) return;

    const val = category.value;

    // hide everything first
    document.querySelectorAll(".category-details").forEach(sec => {
        sec.style.display = "none";
    });

    if (!val) {
        if (common) common.style.display = "none";
        if (conditionBox) conditionBox.style.display = "none";
        return;
    }

    if (common) common.style.display = "block";

    // FIXED IDs (was wrong before)
    if (val === "Cars & Trucks") {
        const el = document.getElementById("section-Cars");
        if (el) el.style.display = "block";
    }

    if (val === "Real Estate") {
        const el = document.getElementById("section-RealEstate");
        if (el) el.style.display = "block";
    }

    const noCondition = ["Pets", "Jobs", "Real Estate"];
    if (conditionBox) {
        conditionBox.style.display = noCondition.includes(val) ? "none" : "block";
    }

    runTranslation();
};

/* =======================
   SAVE AD
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
   // Add this line to find which radio button is checked
const conditionElement = document.querySelector('input[name="itemCondition"]:checked');
const condition = conditionElement ? conditionElement.value : "Not Specified";


    const goNext = () => finalizeAd();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                window.currentAdLat = pos.coords.latitude;
                window.currentAdLng = pos.coords.longitude;
                goNext();
            },
            () => goNext(),
            { timeout: 5000 }
        );
    } else {
        goNext();
    }
}

/* =======================
   FINALIZE AD
======================= */
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

    console.log("Submitting ad:", newAd);

    addDoc(collection(db, "marketplace_ads"), newAd)
        .then(() => {
            alert("Ad posted successfully!");
            window.location.href = "index.html";
        })
        .catch(err => {
            console.error("Firestore error:", err);
            alert("Error: " + err.message);
        });
}

/* =======================
   INIT
======================= */
document.addEventListener("DOMContentLoaded", () => {
    runTranslation();
    handleCategoryChange();

    document.getElementById("postCategory")
        ?.addEventListener("change", handleCategoryChange);

    document.getElementById("photoInput")
        ?.addEventListener("change", handlePhotoUpload);

    document.getElementById("postForm")
        ?.addEventListener("submit", saveNewAd);

    // PayPal
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
   PAYPAL
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
