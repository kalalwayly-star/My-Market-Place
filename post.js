// 1. FIREBASE CONNECTION
import { db, ref, push } from "./firebase-config.js";

// Global Variables
const currentUser = JSON.parse(localStorage.getItem("currentUser")) || { email: "Guest" };
let uploadedImages = []; 


// 3. HANDLE CATEGORY CHANGES
function handleCategoryChange() {
    const mainCategorySelect = document.getElementById('postCategory');
    const commonFields = document.getElementById('commonFields');
    const sections = document.querySelectorAll('.category-details');
    const condSec = document.getElementById('globalCondition');

    if (!mainCategorySelect) return;
    const categoryValue = mainCategorySelect.value;

    // Hide all sections first
    if (sections) {
        sections.forEach(sec => sec.style.display = 'none');
    }

    // If nothing selected, hide everything and stop
    if (categoryValue === "") {
        if (commonFields) commonFields.style.display = 'none';
        if (condSec) condSec.style.display = 'none';
        return;
    }

    // Show common fields (Title, Price, Location)
    if (commonFields) commonFields.style.display = 'block';

    // Show Car & Truck Section
    const carSec = document.getElementById('section-Cars');
    if (categoryValue === 'Cars & Trucks' && carSec) {
        carSec.style.display = 'block';
    }

    // Show Real Estate Section
    const reSec = document.getElementById('section-RealEstate');
    if (categoryValue === 'Real Estate' && reSec) {
        reSec.style.display = 'block';
    }

    // Condition logic: Hide for Pets, Jobs, Real Estate
    const noCondition = ['Pets', 'Jobs', 'Real Estate'];
    if (condSec) {
        condSec.style.display = noCondition.includes(categoryValue) ? 'none' : 'block';
    }
}
// Add this at the bottom of handleCategoryChange inside post.js
if (window.loadLanguage) {
    // This just checks WHAT language YOU picked (En, Ar, Fr)
    const savedLang = localStorage.getItem("language") || "en";
    window.loadLanguage(savedLang); 
}


// 4. PHOTO UPLOAD
window.handlePhotoUpload = async function(event) {
    const gallery = document.getElementById('galleryPreview');
    const files = Array.from(event.target.files);
    if (!gallery) return;

    if (uploadedImages.length + files.length > 10) {
        alert("Maximum 10 photos allowed.");
        return;
    }

    for (const file of files) {
        try {
            const base64 = await compressImage(file);
            uploadedImages.push(base64);
            const div = document.createElement('div');
            div.style.cssText = "position:relative; width:100px; height:100px; display:inline-block; margin:5px;";
            div.innerHTML = `
                <img src="${base64}" style="width:100%; height:100%; object-fit:cover; border-radius:8px; border:1px solid #ddd;">
                <button type="button" onclick="removeImg(event, '${base64}', this)" 
                    style="position:absolute; top:-2px; right:-2px; background:red; color:white; border:none; border-radius:50%; width:20px; height:20px; cursor:pointer;">×</button>
            `;
            gallery.appendChild(div);
        } catch (e) { console.error(e); }
    }
    event.target.value = ""; 
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
                resolve(canvas.toDataURL('image/jpeg', 0.7));
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
    if (!currentUser || currentUser.email === "Guest") { alert("Please login first."); return; }

    const locVal = document.getElementById('adLocation').value.trim();
    if (!locVal) { alert("Location is mandatory."); return; }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            window.currentAdLat = pos.coords.latitude;
            window.currentAdLng = pos.coords.longitude;
            finalizeAd(false);
        },
        () => {
            alert("Proceeding without GPS.");
            finalizeAd(false);
        },
        { timeout: 5000 }
    );
}

function finalizeAd(featuredStatus) {
    const conditionEl = document.querySelector('input[name="condition"]:checked');
    const currentImages = (uploadedImages.length > 0) ? uploadedImages : ['https://placeholder.com'];

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
        carMileage: document.getElementById('carMileage')?.value || "",
        carFuel: document.getElementById('carFuel')?.value || "",
        carTransmission: document.getElementById('carTrans')?.value || "",
        carBody: document.getElementById('carBody')?.value || "",
        image: currentImages,
        isFeatured: featuredStatus,
        status: "Active",
        date: new Date().toLocaleDateString()
    };



    // SAVE TO CLOUD (Firebase)
    const adsRef = ref(db, "marketplace_ads");
    push(adsRef, newAd)
        .then(() => {
            alert("Ad Posted Successfully to the Cloud!");
            window.location.href = "index.html";
        })
        .catch((error) => {
            alert("Error saving to cloud: " + error.message);
        });
}
// This tells the language script to translate the new fields that just appeared
if (window.loadLanguage) {
    window.loadLanguage(localStorage.getItem("language") || "en");
}
// This makes the functions visible to your HTML buttons
window.handleCategoryChange = handleCategoryChange;
window.handlePhotoUpload = handlePhotoUpload;
window.saveNewAd = saveNewAd;
window.removeImg = removeImg;




