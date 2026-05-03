document.addEventListener('DOMContentLoaded', function () {
    let uploadedImages = [];

    function postAd(event) {
        if (event) event.preventDefault();

        const title = document.getElementById('ad-title')?.value.trim();
        const description = document.getElementById('ad-description')?.value.trim();
        const price = document.getElementById('ad-price')?.value.trim();
        const location = document.getElementById('ad-location')?.value.trim();
        const category = document.getElementById('ad-category')?.value;

        const userRaw = localStorage.getItem('loggedInUser');
        if (!userRaw) {
            alert('Please login first!');
            return;
        }
        const user = JSON.parse(userRaw);

        if (!title || !price || !category) {
            alert('Please fill in Title, Price, and Category.');
            return;
        }

        // If no images, save immediately. If images exist, convert then save.
        if (uploadedImages.length === 0) {
            saveAd(title, description, price, location, category, [], user);
        } else {
            const readers = uploadedImages.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(readers).then(imageUrls => {
                saveAd(title, description, price, location, category, imageUrls, user);
            });
        }
    }

    function saveAd(title, description, price, location, category, imageUrls, user) {
        const newAd = {
            id: Date.now().toString(),
            title: title,
            description: description,
            price: price,
            location: location,
            category: category,
            userEmail: user.email,
            images: imageUrls,
            date: new Date().toLocaleDateString()
        };

        const ads = JSON.parse(localStorage.getItem('ads') || "[]");
        ads.push(newAd);
        localStorage.setItem('ads', JSON.stringify(ads));

        alert('Ad Posted Successfully!');
        
        // Redirecting to index after a tiny delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }

    // --- UI Logic & Event Listeners ---

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

    const categorySelect = document.getElementById("ad-category");
    const carInfo = document.getElementById("car-info");
    if (categorySelect && carInfo) {
        categorySelect.addEventListener("change", function () {
            carInfo.style.display = (this.value === "Cars & Trucks") ? "block" : "none";
        });
    }

    const paypalContainer = document.getElementById("paypal-button-container");
    document.querySelectorAll('input[name="featured"]').forEach(radio => {
        radio.addEventListener("change", function () {
            if (paypalContainer) {
                paypalContainer.style.display = (this.value !== "none") ? "block" : "none";
            }
        });
    });

    const postForm = document.getElementById('post-ad-form');
    if (postForm) {
        postForm.addEventListener('submit', postAd);
    }
});

