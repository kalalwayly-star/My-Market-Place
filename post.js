// 1. GLOBAL VARIABLES
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
let uploadedImages = [];

// 2. HANDLE CATEGORY CHANGES
function handleCategoryChange() {
const mainCategorySelect = document.getElementById('postCategory');    if (!mainCategorySelect) return;

    const categoryValue = postCategorySelect.value;
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
// Handle file input
async function handlePhotoUpload(event) {
    const gallery = document.getElementById('galleryPreview');
    const files = Array.from(event.target.files);

    if (uploadedImages.length + files.length > 10) {
        alert("Maximum 10 photos allowed.");
        return;
    }

    for (const file of files) {
        const base64 = await compressImage(file);
        uploadedImages.push(base64);

        const div = document.createElement('div');
        div.className = "preview-container"; // Matches our CSS
        div.innerHTML = `
            <img src="${base64}" class="preview-image">
            <button type="button" class="remove-btn" onclick="removeImg(event, '${base64}', this)">×</button>
        `;
        gallery.appendChild(div);
    }
    event.target.value = ""; // Clear input to allow re-uploading same file if deleted
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
    e.preventDefault();
    uploadedImages = uploadedImages.filter(img => img !== data);
    btn.parentElement.remove();
}

// 4. PAYPAL RENDER FUNCTION
function renderPayPalButtons() {
    const payContainer = document.getElementById('paypal-button-container');
    payContainer.innerHTML = ''; // Clean start

    if (typeof paypal === 'undefined') {
        payContainer.innerHTML = '<p style="color:red;">PayPal failed to load. Check your internet or ad-blocker.</p>';
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
                alert('Payment Successful!');
                finalizeAd(true);
            });
        },
        onCancel: () => {
            alert("Payment cancelled.");
        }
    }).render('#paypal-button-container');
}

// 5. CHECKBOX LISTENER
document.addEventListener('DOMContentLoaded', () => {
    const isFeaturedCheckbox = document.getElementById('isFeatured');
    const payContainer = document.getElementById('paypal-button-container');
    const postBtn = document.getElementById('postBtn');

    document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("photoInput");
    if (input) input.addEventListener("change", handlePhotoUpload);
});

    if (isFeaturedCheckbox) {
        isFeaturedCheckbox.addEventListener('change', function() {
            if (!payContainer || !postBtn) return;

            if (this.checked) {
                postBtn.style.display = 'none';
                payContainer.style.display = 'block';
                renderPayPalButtons();
            } else {
                postBtn.style.display = 'block';
                payContainer.style.display = 'none';
                payContainer.innerHTML = '';
            }
        });
    }
});




// 6. MAIN SAVE LOGIC
function saveNewAd(event) {
    if (event) event.preventDefault();

    if (!currentUser) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    const isFeaturedCheckbox = document.getElementById('isFeatured');
    const isFeatured = isFeaturedCheckbox ? isFeaturedCheckbox.checked : false;

    if (!isFeatured) {
        finalizeAd(false);
    }
}

// 7. FINALIZING DATA
function finalizeAd(featuredStatus) {
    const newAd = {
        id: Date.now(),
        userEmail: currentUser.email,
        category: document.getElementById('postCategory').value,
        title: document.getElementById('adTitle').value,
        price: document.getElementById('adPrice').value,
        location: document.getElementById('adLocation').value,
        description: document.getElementById('adDesc').value,
        // Save images as base64 or the default image
        image: uploadedImages.length > 0 ? uploadedImages : [document.getElementById('adImage').value || 'https://placeholder.com'],
        status: "Active",
        isFeatured: featuredStatus,
        date: new Date().toLocaleDateString()
    };
 
    // Save new ad to localStorage
    const ads = JSON.parse(localStorage.getItem("ads") || "[]");
    ads.push(newAd);
    localStorage.setItem("ads", JSON.stringify(ads));

    alert(featuredStatus ? "Featured Ad Posted!" : "Ad Posted Successfully!");
    window.location.href = "index.html";  // Redirect after posting
}
// 8. FINAL INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    // 1. Fix the Image Upload Listener
    const photoInput = document.getElementById("photoInput");
    if (photoInput) {
        photoInput.addEventListener("change", handlePhotoUpload);
    }

    // 2. Fix the Featured Checkbox Listener
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
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("photoInput");
    if (input) input.addEventListener("change", handlePhotoUpload);
});






