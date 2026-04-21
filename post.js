import { db, ref, push, onValue, set, remove } from "./firebase-config.js";

const currentUser = JSON.parse(localStorage.getItem("currentUser")) || { email: "Guest" };
let uploadedImages = []; 

// 1. INITIALIZE & TRANSLATE
document.addEventListener('DOMContentLoaded', () => {
    const mainCategorySelect = document.getElementById('postCategory');
    if (mainCategorySelect) {
        mainCategorySelect.addEventListener('change', handleCategoryChange);
    }
    
    // Initial run to set up UI and translate
    handleCategoryChange();
    runTranslation(); 
});

// 2. HELPER TO TRIGGER YOUR TRANSLATION
function runTranslation() {
    if (typeof window.loadLanguage === "function") {
        const savedLang = localStorage.getItem("language") || "en";
        window.loadLanguage(savedLang);
    }
}

// 3. HANDLE CATEGORY CHANGES
function handleCategoryChange() {
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

    const carSec = document.getElementById('section-Cars');
    if (categoryValue === 'Cars & Trucks' && carSec) carSec.style.display = 'block';

    const reSec = document.getElementById('section-RealEstate');
    if (categoryValue === 'Real Estate' && reSec) reSec.style.display = 'block';

    const noCondition = ['Pets', 'Jobs', 'Real Estate'];
    if (condSec) {
        condSec.style.display = noCondition.includes(categoryValue) ? 'none' : 'block';
    }

    // IMPORTANT: Re-translate the newly visible fields
    runTranslation();
}

// 4. PHOTO UPLOAD
window.handlePhotoUpload = async function(event) {
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
                    style="position:absolute; top:-5px; right:-5px; background:red; color:white; border:none; border-radius:50%; cursor:pointer;">×</button>
            `;
            gallery.appendChild(div);
        } catch (e) { console.error(e); }
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

window.removeImg = function(e, data, btn) {
    e.stopPropagation();
    uploadedImages = uploadedImages.filter(img => img !== data);
    btn.parentElement.remove();
}

// 5. SAVE LOGIC
window.saveNewAd = function(event) {
    if (event) event.preventDefault();
    if (!currentUser || currentUser.email === "Guest") { alert("Please login."); return; }

    const locVal = document.getElementById('adLocation').value.trim();
    if (!locVal) { alert("Location required."); return; }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            window.currentAdLat = pos.coords.latitude;
            window.currentAdLng = pos.coords.longitude;
            finalizeAd(false);
        },
        () => { finalizeAd(false); },
        { timeout: 3000 }
    );
}

function finalizeAd(featuredStatus) {
    const conditionEl = document.querySelector('input[name="condition"]:checked');
    const newAd = {
        id: Date.now(),
        userEmail: currentUser.email,
        category: document.getElementById('postCategory').value,
        title: document.getElementById('adTitle').value,
        price: document.getElementById('adPrice').value,
        location: document.getElementById('adLocation').value,
        lat: window.currentAdLat || null,
        lng: window.currentAdLng || null,
        description: document.getElementById('adDesc').value,
        condition: conditionEl ? conditionEl.value : "N/A",
        carMake: document.getElementById('carMake')?.value || "",
        carYear: document.getElementById('carYear')?.value || "",
        image: uploadedImages.length > 0 ? uploadedImages : ['https://placeholder.com'],
        status: "Active",
        date: new Date().toLocaleDateString()
    };

    push(ref(db, "marketplace_ads"), newAd)
        .then(() => {
            alert("Success!");
            window.location.href = "index.html";
        })
        .catch(err => alert("Error: " + err.message));
}

// Export for HTML
window.handleCategoryChange = handleCategoryChange;




