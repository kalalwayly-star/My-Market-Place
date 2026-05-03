document.addEventListener('DOMContentLoaded', function () {
    let uploadedImages = [];

   function postAd(event) {
    if (event) event.preventDefault();

    // Get values safely
    const title = document.getElementById('ad-title')?.value.trim();
    const description = document.getElementById('ad-description')?.value.trim();
    const price = document.getElementById('ad-price')?.value.trim();
    const location = document.getElementById('ad-location')?.value.trim();
    const category = document.getElementById('ad-category')?.value;
    const imageFiles = uploadedImages;  // Assuming uploadedImages is an array of selected files

    // Validate login
    const userRaw = localStorage.getItem('loggedInUser');
    if (!userRaw) {
        alert('Please login first!');
        return;
    }
    const user = JSON.parse(userRaw);

    // Basic Validation
    if (!title || !price || !category) {
        alert('Please fill in Title, Price, and Category.');
        return;
    }

    // Convert images to base64
    const imageUrls = [];
    imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = function () {
            imageUrls.push(reader.result);  // This will hold base64 encoded images
            if (imageUrls.length === imageFiles.length) {
                saveAd(title, description, price, location, category, imageUrls, user);
            }
        };
        reader.readAsDataURL(file);  // Convert file to base64
    });
}

// Save the ad with images
function saveAd(title, description, price, location, category, imageUrls, user) {
    const newAd = {
        id: Date.now().toString(),
        title: title,
        description: description,
        price: price,
        location: location,
        category: category,
        userEmail: user.email,
        images: imageUrls,  // Store images in the ad object
        date: new Date().toLocaleDateString()
    };

    // Save ad to localStorage
    const ads = JSON.parse(localStorage.getItem('ads') || "[]");
    ads.push(newAd);
    localStorage.setItem('ads', JSON.stringify(ads));

    alert('Ad Posted Successfully!');
    window.location.href = 'myads.html';

}

    // Handle the image upload preview
    const adImageInput = document.getElementById('ad-image');
    if (adImageInput) {
        adImageInput.addEventListener('change', function (event) {
            const files = Array.from(event.target.files || []);
            const previewContainer = document.getElementById('image-previews');

            if (!previewContainer || !files.length) return;

            if (uploadedImages.length + files.length > 6) {
                alert('You can upload up to 6 images only.');
                return;
            }

            files.forEach((file) => {
                const previewDiv = document.createElement('div');
                previewDiv.className = 'image-preview';

                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                previewDiv.appendChild(img);

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'X';
                deleteBtn.onclick = function () {
                    uploadedImages = uploadedImages.filter(f => f !== file);
                    previewDiv.remove();
                };
                previewDiv.appendChild(deleteBtn);
                previewContainer.appendChild(previewDiv);
                uploadedImages.push(file);
            });
            event.target.value = '';
        });
    }

    // Car-specific category logic (optional)
    const categorySelect = document.getElementById("ad-category");
    const carInfo = document.getElementById("car-info");

    if (categorySelect) {
        categorySelect.addEventListener("change", function () {
            if (this.value === "Cars & Trucks") {
                carInfo.style.display = "block";
            } else {
                carInfo.style.display = "none";
            }
        });
    }

    // PayPal UI Logic (for Featured Ads)
    const paypalContainer = document.getElementById("paypal-button-container");
    document.querySelectorAll('input[name="featured"]').forEach(radio => {
        radio.addEventListener("change", function () {
            paypalContainer.style.display = (this.value !== "none") ? "block" : "none";
        });
    });

    // Form submission listener
    const postForm = document.getElementById('post-ad-form');
    if (postForm) {
        postForm.addEventListener('submit', postAd);
    }
});

