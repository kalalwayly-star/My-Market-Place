// 1. GLOBAL VARIABLES (Declared only once)
const STORAGE_KEY = "marketplace_ads"; 
const currentUser = JSON.parse(localStorage.getItem("currentUser")) || { email: "Guest" };
let uploadedImages = []; 

// 2. HANDLE CATEGORY CHANGES
function handleCategoryChange() {
    // 1. Get the elements
    const mainCategorySelect = document.getElementById('postCategory');
    const commonFields = document.getElementById('commonFields');
    const sections = document.querySelectorAll('.category-details');
    const condSec = document.getElementById('globalCondition');

    // 2. Safety check - if the dropdown is missing, stop
    if (!mainCategorySelect) return;
    const categoryValue = mainCategorySelect.value;

    // 3. Hide all specific sections (Cars, Real Estate, etc.)
    if (sections) {
        sections.forEach(sec => sec.style.display = 'none');
    }

    // 4. If no category is picked, hide everything and stop
    if (categoryValue === "") {
        if (commonFields) commonFields.style.display = 'none';
        if (condSec) condSec.style.display = 'none';
        return;
    }

    // 5. Show common fields (Title, Price, etc.)
    if (commonFields) commonFields.style.display = 'block';

    // 6. Show Car section specifically
    const carSec = document.getElementById('section-Cars');
    if (categoryValue === 'Cars & Trucks' && carSec) {
        carSec.style.display = 'block';
    }

    // 7. Show Real Estate section specifically
    const reSec = document.getElementById('section-RealEstate');
    if (categoryValue === 'Real Estate' && reSec) {
        reSec.style.display = 'block';
    }

    // 8. Condition Box logic (Hide for Pets, Jobs, Real Estate)
    const noCondition = ['Pets', 'Jobs', 'Real Estate'];
    if (condSec) {
        if (noCondition.includes(categoryValue)) {
            condSec.style.display = 'none';
        } else {
            condSec.style.display = 'block';
        }
    }
} // <--- Make sure there is only ONE closing bracket here


    // Show common fields since a category is selected
    if (commonFields) commonFields.style.display = 'block';

    // 1. Show Specific Category Sections
    if (categoryValue === 'Cars & Trucks') {
        document.getElementById('section-Cars').style.display = 'block';
    } else if (categoryValue === 'Real Estate') {
        document.getElementById('section-RealEstate').style.display = 'block';
    }

    // 2. Logic for Condition Box (Hide for Pets, Jobs, Real Estate)
    const noCondition = ['Pets', 'Jobs', 'Real Estate'];
    
    if (condSec) {
        if (noCondition.includes(categoryValue)) {
            condSec.style.display = 'none';
        } else {
            condSec.style.display = 'block';
        }
    }
}

// 3. PHOTO UPLOAD
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

function removeImg(e, data, btn) {
    e.stopPropagation();
    uploadedImages = uploadedImages.filter(img => img !== data);
    btn.parentElement.remove();
}

// 4. SAVE LOGIC
function saveNewAd(event) {
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
    
    // Safety check for images
    const currentImages = (typeof uploadedImages !== 'undefined' && uploadedImages.length > 0) 
        ? uploadedImages 
        : ['https://placeholder.com'];

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
        // Car & Truck Specific Fields
        carMake: document.getElementById('carMake')?.value || "",
        carYear: document.getElementById('carYear')?.value || "",
        carMileage: document.getElementById('carMileage')?.value || "",
        carFuel: document.getElementById('carFuel')?.value || "",
        carTransmission: document.getElementById('carTrans')?.value || "",
        carBody: document.getElementById('carBody')?.value || "",
        // Image and Status
        image: currentImages,
        isFeatured: featuredStatus,
        status: "Active",
        date: new Date().toLocaleDateString()
    };

 
    // Use 'myAds' if STORAGE_KEY is not defined elsewhere
    const key = typeof STORAGE_KEY !== 'undefined' ? STORAGE_KEY : 'myAds';
    const ads = JSON.parse(localStorage.getItem(key) || "[]");
    ads.push(newAd);
    localStorage.setItem(key, JSON.stringify(ads));

    alert("Ad Posted Successfully!");
    window.location.href = "index.html";
}


