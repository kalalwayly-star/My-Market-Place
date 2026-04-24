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

    // Hide all sections first
    sections.forEach(sec => sec.style.display = 'none');

    // Reset the condition field visibility
    if (conditionBox) conditionBox.style.display = 'none';

    if (!val) {
        if (common) common.style.display = 'none';
        return;
    }

    if (common) common.style.display = 'block';

    // Show condition field only for specific categories
    const categoriesWithCondition = ['Electronics', 'Furniture', 'Cars & Trucks', 'Fashion'];

    if (categoriesWithCondition.includes(val)) {
        if (conditionBox) conditionBox.style.display = 'block';
    }

    // Handle specific categories
    if (val === 'Cars & Trucks') {
        document.getElementById('section-Cars')?.style.display = 'block';
    }

    if (val === 'Real Estate') {
        document.getElementById('section-RealEstate')?.style.display = 'block';
    }

    runTranslation();
};

// PHOTO UPLOAD
window.handlePhotoUpload = async function (event) {
    const gallery = document.getElementById('galleryPreview');
    const files = Array.from(event.target.files);
    if (!gallery) return;

    if (uploadedImages.length + files.length > 10) {
        alert("Max 10 photos.");
        return;
    }

    for (const file of files) {
        const base64 = await compressImage(file);
        uploadedImages.push(base64);

        const div = document.createElement('div');
        div.style.cssText = "position:relative;width:80px;height:80px;margin:5px;display:inline-block;";
        div.innerHTML = `
            <img src="${base64}" style="width:100%;height:100%;object-fit:cover;">
            <button type="button" onclick="removeImg(event, '${base64}', this)">×</button>
        `;
        gallery.appendChild(div);
    }
};

function compressImage(file) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height, max = 800;

                if (w > max || h > max) {
                    if (w > h) { h *= max / w; w = max; }
                    else { w *= max / h; h = max; }
                }

                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);

                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

window.removeImg = function (e, data, btn) {
    e.stopPropagation();
    uploadedImages = uploadedImages.filter(img => img !== data);
    btn.parentElement.remove();
};

// SAVE AD
function saveNewAd(event) {
    event.preventDefault();

    console.log("SAVE CLICKED");

    const user = auth.currentUser;
    if (!user) {
        alert("Login required");
        return;
    }

    const locationVal = document.getElementById('adLocation').value.trim();
    if (!locationVal) {
        alert("Location required");
        return;
    }

    // ✅ GET CONDITION PROPERLY
    const conditionEl = document.querySelector('input[name="condition"]:checked');
    const condition = conditionEl ? conditionEl.value : "Unknown";

    const btn = document.getElementById("postBtn");
    if (btn) {
        btn.disabled = true;
        btn.innerText = "Posting...";
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                window.currentAdLat = pos.coords.latitude;
                window.currentAdLng = pos.coords.longitude;
                finalizeAd(condition);
            },
            () => finalizeAd(condition),
            { timeout: 3000 }
        );
    } else {
        finalizeAd(condition);
    }
}

// FINAL SAVE
function finalizeAd(condition) {
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

    // Get the selected condition (New or Used)
    const adCondition = conditionEl ? conditionEl.value : "Unknown";

    const newAd = {
        userId: user.uid,
        userEmail: user.email,
        category: categoryEl.value,
        title: titleEl.value,
        price: priceEl.value,
        location: locationEl.value,
        description: descEl.value,
        condition: adCondition,  // Store the condition value
        image: uploadedImages.length ? uploadedImages : ['https://via.placeholder.com/300'],
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

// INIT
document.addEventListener("DOMContentLoaded", () => {
    runTranslation();
    handleCategoryChange();

    const form = document.getElementById("postForm");
    if (form) {
        form.addEventListener("submit", saveNewAd);
    }

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
