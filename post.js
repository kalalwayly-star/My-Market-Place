// 1. GLOBAL VARIABLES
const currentUser = JSON.parse(localStorage.getItem("currentUser")) || { email: "Guest" };
let uploadedImages = []; 

// 2. HANDLE CATEGORY CHANGES
function handleCategoryChange() {
    const mainCategorySelect = document.getElementById('postCategory');
    const commonFields = document.getElementById('commonFields');
    const sections = document.querySelectorAll('.category-details');

    if (!mainCategorySelect) return;
    const categoryValue = mainCategorySelect.value;

    // Hide all dynamic sections
    sections.forEach(sec => sec.style.display = 'none');
    
    // Hide condition section by default
    const condSec = document.getElementById('conditionSection');
    if (condSec) condSec.style.display = 'none';

    if (categoryValue === "") {
        if (commonFields) commonFields.style.display = 'none';
        return;
    }

    if (commonFields) commonFields.style.display = 'block';

    // Show specific sections
    if (categoryValue === "Cars & Trucks") {
        document.getElementById('section-Cars').style.display = 'block';
        if (condSec) condSec.style.display = 'block';
    } else if (categoryValue === "Real Estate") {
        document.getElementById('section-RealEstate').style.display = 'block';
    } else if (categoryValue !== "Jobs") {
        if (condSec) condSec.style.display = 'block';
    }
}

// 3. PHOTO UPLOAD LOGIC
async function handlePhotoUpload(event) {
    const gallery = document.getElementById('galleryPreview');
    const files = Array.from(event.target.files);

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
                    style="position:absolute; top:-5px; right:-5px; background:red; color:white; border:none; border-radius:50%; width:22px; height:22px; cursor:pointer; font-weight:bold; display:flex; align-items:center; justify-content:center;">×</button>
            `;
            gallery.appendChild(div);
        } catch (error) {
            console.error("Error processing image:", error);
        }
    }
    event.target.value = ""; 
}

// 3b. COMPRESS IMAGE (CRITICAL - WAS MISSING)
function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX = 800;
                if (width > height && width > MAX) { height *= MAX / width; width = MAX; }
                else if (height > MAX) { width *= MAX / height; height = MAX; }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        };
    });
}

function removeImg(e, data, btn) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    uploadedImages = uploadedImages.filter(img => img !== data);
    btn.parentElement.remove();
}

// 4. PAYPAL LOGIC
function togglePayPal(checkbox) {
    const container = document.getElementById('paypal-button-container');
    const postBtn = document.getElementById('postBtn');
    
    if (checkbox.checked) {
        container.style.display = 'block';
        postBtn.style.display = 'none';
        renderPayPalButtons();
    } else {
        container.style.display = 'none';
        postBtn.style.display = 'block';
    }
}

function renderPayPalButtons() {
    const payContainer = document.getElementById('paypal-button-container');
    if (!payContainer) return;
    payContainer.innerHTML = ''; 

    if (typeof paypal === 'undefined') {
        payContainer.innerHTML = '<p style="color:red;">PayPal failed to load.</p>';
        return;
    }

    paypal.Buttons({
        createOrder: (data, actions) => {
            return actions.order.create({ purchase_units: [{ amount: { value: '4.99' } }] });
        },
        onApprove: (data, actions) => {
            return actions.order.capture().then(details => {
                finalizeAd(true);
            });
        }
    }).render('#paypal-button-container');
}

// 5. SAVE LOGIC
function saveNewAd(event) {
    if (event) event.preventDefault();
    if (!currentUser) { alert("Please login first."); return; }

    const title = document.getElementById('adTitle').value;
    if (!title) { alert("Please enter a title."); return; }

    finalizeAd(false);
}

function finalizeAd(featuredStatus) {
    const newAd = {
        id: Date.now(),
        userEmail: currentUser.email,
        category: document.getElementById('postCategory').value,
        title: document.getElementById('adTitle').value,
        price: document.getElementById('adPrice').value,
        location: document.getElementById('adLocation').value,
        description: document.getElementById('adDesc').value,
        image: uploadedImages.length > 0 ? uploadedImages : ['https://placeholder.com'],
        isFeatured: featuredStatus,
        date: new Date().toLocaleDateString()
    };
 
    const ads = JSON.parse(localStorage.getItem("ads") || "[]");
    ads.push(newAd);
    localStorage.setItem("ads", JSON.stringify(ads));

    alert(featuredStatus ? "Featured Ad Posted!" : "Ad Posted Successfully!");
    window.location.href = "index.html";
}



