document.addEventListener('DOMContentLoaded', function () {
    let uploadedImages = [];

    // Function to post a new ad
    function postAd(event) {
        if (event) event.preventDefault();

        // 1. Get form values safely
        const title = document.getElementById('ad-title')?.value.trim();
        const description = document.getElementById('ad-description')?.value.trim();
        const price = document.getElementById('ad-price')?.value.trim();
        const location = document.getElementById('ad-location')?.value.trim();
        const category = document.getElementById('ad-category')?.value;

        // 2. Validate login
        const userRaw = localStorage.getItem('loggedInUser');
        if (!userRaw) {
            alert('Please login first!');
            return;
        }
        const user = JSON.parse(userRaw);

        // 3. Basic Validation
        if (!title || !price || !category) {
            alert('Please fill in Title, Price, and Category.');
            return;
        }

        // 4. Convert images to base64 format
        const convertImages = async () => {
            const promises = uploadedImages.map(file => {
                return new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
            });

            return Promise.all(promises);
        };

        convertImages().then(imagesBase64 => {
            // 5. Create the Ad Object
            const newAd = {
                id: Date.now().toString(),
                title,
                description,
                price,
                location,
                category,
                userEmail: user.email,
                images: imagesBase64, // Save images as base64
                date: new Date().toLocaleDateString()
            };

            // 6. Save the Ad to LocalStorage
            const ads = JSON.parse(localStorage.getItem('ads') || "[]");
            ads.push(newAd);
            localStorage.setItem('ads', JSON.stringify(ads));

            alert('Ad Posted Successfully!');
            window.location.href = 'myads.html';  // Redirect to My Ads page
        });
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

