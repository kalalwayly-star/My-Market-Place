const STORAGE_KEY = "marketplace_ads"; 

// 1. GLOBAL VARIABLES & KEY SYNC
const currentUser = JSON.parse(localStorage.getItem("currentUser")) || { email: "Guest" };
const STORAGE_KEY = "marketplace_ads"; // Matches your main.js/storage.js
let uploadedImages = []; 

// 2. HANDLE CATEGORY CHANGES
function handleCategoryChange() {
    const mainCategorySelect = document.getElementById('postCategory');
    const commonFields = document.getElementById('commonFields');
    const sections = document.querySelectorAll('.category-details');
    const condSec = document.getElementById('conditionSection');

    if (!mainCategorySelect) return;
    const categoryValue = mainCategorySelect.value;

    sections.forEach(sec => sec.style.display = 'none');
    if (condSec) condSec.style.display = 'none';

    if (categoryValue === "") {
        if (commonFields) commonFields.style.display = 'none';
        return;
    }

    if (commonFields) commonFields.style.display = 'block';

    // Show specific sections
    if (categoryValue === "Cars & Trucks") {
        const carSec = document.getElementById('section-Cars');
        if (carSec) carSec.style.display = 'block';
        if (condSec) condSec.style.display = 'block';
    } else if (categoryValue === "Real Estate") {
        const reSec = document.getElementById('section-RealEstate');
        if (reSec) reSec.style.display = 'block';
    } else if (categoryValue !== "Jobs") {
        if (condSec) condSec.style.display = 'block';
    }
}

// 3. PHOTO UPLOAD & COMPRESSION
async function handlePhotoUpload(event) {
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
    return new Promise((resolve, reject) => {
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

function removeImg(e, data, btn) {
    e.stopPropagation();
    uploadedImages = uploadedImages.filter(img => img !== data);
    btn.parentElement.remove();
}

// 4. SAVE & GPS LOGIC
// --- 5. SAVE LOGIC ---
function saveNewAd(event) {
    if (event) event.preventDefault();
    
    // 1. Basic Auth Check
    if (!currentUser || currentUser.email === "Guest") { 
        alert("Please login first."); 
        return; 
    }

    // 2. Location Field Check
    const locationInput = document.getElementById('adLocation');
    if (!locationInput || !locationInput.value.trim()) {
        alert("Location is mandatory.");
        if(locationInput) locationInput.focus();
        return;
    }

    // 3. Get GPS coordinates BEFORE finalizing for the 75km filter
    navigator.geolocation.getCurrentPosition(
        (position) => {
            window.currentAdLat = position.coords.latitude;
            window.currentAdLng = position.coords.longitude;
            finalizeAd(false);
        },
        (error) => {
            alert("Warning: Location access denied. Your ad won't show in 'Nearby' searches.");
            finalizeAd(false);
        },
        { timeout: 5000 }
    );
}

function finalizeAd(featuredStatus) {
    // Get Selected Condition (New or Used)
    const conditionEl = document.querySelector('input[name="condition"]:checked');
    
    const newAd = {
        id: Date.now(),
        userEmail: currentUser.email,
        category: document.getElementById('postCategory').value,
        title: document.getElementById('adTitle').value,
        price: document.getElementById('adPrice').value,
        location: document.getElementById('adLocation').value,
        // Captured GPS coordinates
        lat: window.currentAdLat || null,
        lng: window.currentAdLng || null,
        description: document.getElementById('adDesc').value,
        condition: conditionEl ? conditionEl.value : "N/A",
        // Car specific data (grabs value only if the field exists)
        carYear: document.getElementById('carYear')?.value || "",
        carMileage: document.getElementById('carMileage')?.value || "",
        carFuel: document.getElementById('carFuel')?.value || "",
        // Image logic
        image: uploadedImages.length > 0 ? uploadedImages : ['https://placeholder.com'],
        isFeatured: featuredStatus,
        status: "Active",
        date: new Date().toLocaleDateString()
    };
 
    // Save to the correct key so index.html can see it
    const ads = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    ads.push(newAd);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));

    alert("Ad Posted Successfully!");
    
    // Redirect to Home Page
    window.location.href = "index.html";
}

