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

    sections.forEach(sec => sec.style.display = 'none');

    if (!val) {
        if (common) common.style.display = 'none';
        if (conditionBox) conditionBox.style.display = 'none';
        return;
    }

    if (common) common.style.display = 'block';

    if (val === 'Cars & Trucks') {
        document.getElementById('section-Cars')?.style.display = 'block';
    }

    if (val === 'Real Estate') {
        document.getElementById('section-RealEstate')?.style.display = 'block';
    }

    const noCondition = ['Pets', 'Jobs', 'Real Estate'];
    if (conditionBox) {
        conditionBox.style.display = noCondition.includes(val) ? 'none' : 'block';
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

    const location = document.getElementById('adLocation').value.trim();
    if (!location) {
        alert("Location required");
        return;
    }

   

    const btn = document.getElementById("postBtn");
    btn.disabled = true;
    btn.innerText = "Posting...";

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

    const newAd = {
        userId: user.uid,
        userEmail: user.email,
        category: document.getElementById('postCategory').value,
        title: document.getElementById('adTitle').value,
        price: document.getElementById('adPrice').value,
        location: document.getElementById('adLocation').value,
        description: document.getElementById('adDesc').value,
        condition: condition,
        image: uploadedImages.length ? uploadedImages : ['https://via.placeholder.com/300'],
        date: new Date().toLocaleDateString(),
        lat: window.currentAdLat || null,
        lng: window.currentAdLng || null
    };

    addDoc(collection(db, "marketplace_ads"), newAd)
        .then(() => {
            alert("Posted!");
            window.location.href = "index.html";
        })
        .catch(err => {
            alert(err.message);
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
