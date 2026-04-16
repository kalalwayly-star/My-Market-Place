// 1. GLOBAL VARIABLES
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
let uploadedImages = []; 

// 2. HANDLE CATEGORY CHANGES
function handleCategoryChange() {
    const mainCategorySelect = document.getElementById('postCategory');
    if (!mainCategorySelect) return;

    const categoryValue = mainCategorySelect.value; // Fixed: was using 'postCategorySelect'
    const commonFields = document.getElementById('commonFields');
    const sections = document.querySelectorAll('.category-details');

    sections.forEach(sec => sec.style.display = 'none');

    if (categoryValue === "") {
        if (commonFields) commonFields.style.display = 'none';
        return;
    }

    if (commonFields) commonFields.style.display = 'block';

    let sectionId = "";
    if (categoryValue === "Cars & Trucks") sectionId = "section-Cars";
    if (categoryValue === "Real Estate") sectionId = "section-RealEstate";

    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.style.display = 'block';
}

// 3. PHOTO UPLOAD LOGIC
async function handlePhotoUpload(event) {
    const gallery = document.getElementById('galleryPreview');
    if (!gallery) return;

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
            div.className = "preview-container";
            div.innerHTML = `
                <img src="${base64}" class="preview-image">
                <button type="button" class="remove-btn" onclick="removeImg(event, '${base64}', this)">×</button>
            `;
            gallery.appendChild(div);
        } catch (error) {
            console.error("Error processing image:", error);
        }
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
                let width = img.width;
                let height = img.height;
                const MAX = 800;
                if (width > height && width > MAX) { height *= MAX / width; width = MAX; }
                else if (height > MAX) { width *= MAX / height; height = MAX; }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        };
    });
}

function removeImg(e, data, btn) {
    e.preventDefault();
    uploadedImages = uploadedImages.filter(img => img !== data);
    btn.parentElement.remove();
}

// 4. PAYPAL RENDER FUNCTION
function renderPayPalButtons() {
    const payContainer = document.getElementById('paypal-button-container');
    if (!payContainer) return;
    payContainer.innerHTML = ''; 

    if (typeof paypal === 'undefined') {
        payContainer.innerHTML = '<p style="color:red;">PayPal failed to load.</p>';
        return;
    }

    paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
        createOrder: (data, actions) => {
            return actions.order.create({
                purchase_units: [{ amount: { value: '4.99' } }]
            });
        },
        onApprove: (data, actions) => {
            return actions.order.capture().then(details => {
                finalizeAd(true);
            });
        }
    }).render('#paypal-button-container');
}

// 5. MAIN SAVE LOGIC (Post Button calls this)
function saveNewAd(event) {
    if (event) event.preventDefault();

    if (!currentUser) {
        alert("Please login first.");
        return;
    }

    const title = document.getElementById('adTitle').value;
    if (!title) {
        alert("Please enter a title.");
        return;
    }

    const isFeaturedCheckbox = document.getElementById('isFeatured');
    const isFeatured = isFeaturedCheckbox ? isFeaturedCheckbox.checked : false;

    if (!isFeatured) {
        finalizeAd(false);
    }
}

// 6. FINALIZING DATA
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
        status: "Active",
        isFeatured: featuredStatus,
        date: new Date().toLocaleDateString()
    };
 
    const ads = JSON.parse(localStorage.getItem("ads") || "[]");
    ads.push(newAd);
    localStorage.setItem("ads", JSON.stringify(ads));

    alert(featuredStatus ? "Featured Ad Posted!" : "Ad Posted Successfully!");
    window.location.href = "index.html";
}

// 7. INITIALIZATION (Run once when page loads)
document.addEventListener("DOMContentLoaded", () => {
    const isFeaturedCheckbox = document.getElementById('isFeatured');
    const payContainer = document.getElementById('paypal-button-container');
    const postBtn = document.getElementById('postBtn');

    if (isFeaturedCheckbox) {
        isFeaturedCheckbox.addEventListener('change', function() {
            if (this.checked) {
                if (postBtn) postBtn.style.display = 'none';
                if (payContainer) {
                    payContainer.style.display = 'block';
                    renderPayPalButtons();
                }
            } else {
                if (postBtn) postBtn.style.display = 'block';
                if (payContainer) {
                    payContainer.style.display = 'none';
                    payContainer.innerHTML = '';
                }
            }
        });
    }
});


