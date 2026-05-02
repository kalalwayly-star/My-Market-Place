document.addEventListener('DOMContentLoaded', function() {
    let uploadedImages = [];

    // Function to post a new ad
    function postAd(event) {
        event.preventDefault(); // Prevents page refresh

        const title = document.getElementById('ad-title').value.trim();
        const description = document.getElementById('ad-description').value.trim();
        const price = document.getElementById('ad-price').value.trim();
        const location = document.getElementById('ad-location').value.trim();
        const category = document.getElementById('ad-category').value;
        const condition = document.getElementById('ad-condition').value;
        
        const featuredElement = document.querySelector('input[name="featured"]:checked');
        const featuredAd = featuredElement ? featuredElement.value : 'none';

        const user = JSON.parse(localStorage.getItem('loggedInUser'));

        if (!user) {
            alert('You must be logged in to post an ad!');
            return;
        }

        if (!title || !description || !price || !location) {
            alert('Please fill in all the required fields.');
            return;
        }

        const newAd = {
            id: Date.now().toString(),
            title,
            description,
            price,
            location,
            category,
            condition,
            featuredAd,
            userId: user.email,
            date: new Date().toLocaleDateString()
        };

        const ads = JSON.parse(localStorage.getItem('ads')) || [];
        ads.push(newAd);
        localStorage.setItem('ads', JSON.stringify(ads));

        alert('Your ad has been posted successfully!');
        window.location.href = 'myads.html';
    }

    // Form submission listener
    const postForm = document.getElementById('post-ad-form');
    if (postForm) {
        postForm.addEventListener('submit', postAd);
    }

    // Handle the photo upload
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

    // Car Details Logic
    const categorySelect = document.getElementById("ad-category");
    const carInfo = document.getElementById("car-info");
    
    if(categorySelect) {
        categorySelect.addEventListener("change", function() {
            carInfo.style.display = this.value === "Cars & Trucks" ? "block" : "none";
        });
    }

    // Populate Year, Make, Model
    const yearSelect = document.getElementById("car-year");
    const makeSelect = document.getElementById("car-make");
    const modelSelect = document.getElementById("car-model");

    if (yearSelect) {
        const currentYear = new Date().getFullYear();
        for (let year = 2001; year <= currentYear; year++) {
            const option = new Option(year, year);
            yearSelect.add(option);
        }
    }

    const carData = {
        "Toyota": ["Corolla", "Camry", "Hilux"],
        "Honda": ["Civic", "Accord", "CR-V"],
        "Ford": ["Focus", "Fiesta", "Mustang"]
    };

    if (makeSelect) {
        Object.keys(carData).forEach(make => {
            makeSelect.add(new Option(make, make));
        });

        makeSelect.addEventListener("change", function() {
            modelSelect.innerHTML = '<option value="">Select a Model</option>';
            const models = carData[this.value] || [];
            models.forEach(m => modelSelect.add(new Option(m, m)));
        });
    }

    // PayPal UI Logic
    const paypalContainer = document.getElementById("paypal-button-container");
    document.querySelectorAll('input[name="featured"]').forEach(radio => {
        radio.addEventListener("change", function() {
            paypalContainer.style.display = (this.value !== "none") ? "block" : "none";
        });
    });
});

