document.addEventListener('DOMContentLoaded', function () {

    let uploadedImages = [];
    let paypalPaid = false;

    // -----------------------------
    // CATEGORY RULES
    // -----------------------------
    function getMaxImages(category) {
        if (category === "Cars" || category === "Cars & Trucks" || category === "Real Estate") {
            return 6;
        }
        return 3;
    }

    function showCarFields(category) {
        const carInfo = document.getElementById('car-info');
        if (!carInfo) return;

        if (category === "Cars" || category === "Cars & Trucks") {
            carInfo.style.display = "block";
        } else {
            carInfo.style.display = "none";
        }
    }

    function hideConditionIfNeeded(category) {
        const condition = document.getElementById('condition-field');
        if (!condition) return;

        const hideFor = ["Jobs", "Services", "Real Estate", "Business", "Cars", "Cars & Trucks"];

        if (hideFor.includes(category)) {
            condition.style.display = "none";
        } else {
            condition.style.display = "block";
        }
    }

    // -----------------------------
    // IMAGE COMPRESSION
    // -----------------------------
    function compressImage(file, maxWidth = 800, quality = 0.65) {
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = function (e) {
                const img = new Image();
                img.src = e.target.result;

                img.onload = function () {
                    const canvas = document.createElement("canvas");

                    const scale = maxWidth / img.width;
                    canvas.width = maxWidth;
                    canvas.height = img.height * scale;

                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    resolve(canvas.toDataURL("image/jpeg", quality));
                };
            };

            reader.readAsDataURL(file);
        });
    }

    // -----------------------------
    // POST AD
    // -----------------------------
    function postAd(event) {
        if (event) event.preventDefault();

        const title = document.getElementById('ad-title')?.value.trim();
        const description = document.getElementById('ad-description')?.value.trim();
        const price = document.getElementById('ad-price')?.value.trim();
        const location = document.getElementById('ad-location')?.value.trim();
        const category = document.getElementById('ad-category')?.value;
        const featuredOption = document.querySelector('input[name="featured"]:checked')?.value || 'none';

        const userRaw = localStorage.getItem('loggedInUser');
        if (!userRaw) {
            alert('Please login first!');
            return;
        }

        const user = JSON.parse(userRaw);

        if (!title || !price || !category) {
            alert('Please fill Title, Price, Category.');
            return;
        }

        // PayPal required for featured ads
        if (featuredOption !== 'none' && !paypalPaid) {
            alert('Complete PayPal payment first.');
            return;
        }

        const carFields = {
            make: document.getElementById("car-make")?.value || "",
            model: document.getElementById("car-model")?.value || "",
            year: document.getElementById("car-year")?.value || "",
            fuel: document.getElementById("car-fuel")?.value || "",
            transmission: document.getElementById("car-transmission")?.value || "",
            kms: document.getElementById("car-kms")?.value || ""
        };

        const processImages = async () => {
            if (uploadedImages.length === 0) {
                return [];
            }

            const results = [];
            for (let file of uploadedImages) {
                results.push(await compressImage(file));
            }
            return results;
        };

        processImages().then(imageUrls => {
            saveAd(title, description, price, location, category, imageUrls, user, featuredOption, carFields);
        });
    }

    // -----------------------------
    // SAVE AD
    // -----------------------------
    function saveAd(title, description, price, location, category, imageUrls, user, featuredOption, carFields) {

        const newAd = {
            id: Date.now().toString(),
            title,
            description,
            price,
            location,
            category,

            images: imageUrls,
            image: imageUrls[0] || "",

            userId: user.email,
            userEmail: user.email,

            featured: featuredOption,
            date: new Date().toLocaleDateString(),

            // CAR DATA
            car: carFields
        };

        const ads = JSON.parse(localStorage.getItem('ads') || '[]');
ads.push(newAd);
localStorage.setItem('ads', JSON.stringify(ads));

        // storage safety check
        const size = new Blob([JSON.stringify(ads)]).size;
        if (size > 4.5 * 1024 * 1024) {
            alert("Storage full. Delete old ads first.");
            return;
        }

        ads.push(newAd);
        localStorage.setItem('ads', JSON.stringify(ads));

        alert('Ad Posted Successfully!');

        setTimeout(() => {
            window.location.href = 'myads.html';
        }, 500);
    }

    // -----------------------------
    // IMAGE UPLOAD
    // -----------------------------
    const adImageInput = document.getElementById('ad-image');

    if (adImageInput) {
        adImageInput.addEventListener('change', function (event) {

            const category = document.getElementById('ad-category')?.value;
            const maxImages = getMaxImages(category);

            const files = Array.from(event.target.files || []);
            const previewContainer = document.getElementById('image-previews');

            if (!previewContainer || !files.length) return;

            if (uploadedImages.length + files.length > maxImages) {
                alert(`Max ${maxImages} images allowed for this category.`);
                return;
            }

            files.forEach(file => {

                const previewDiv = document.createElement('div');
                previewDiv.className = 'image-preview';

                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.style.width = "100px";
                img.style.height = "100px";
                img.style.objectFit = "cover";
                img.style.borderRadius = "6px";

                const btn = document.createElement('button');
                btn.type = "button";
                btn.innerText = "X";

                btn.onclick = () => {
                    uploadedImages = uploadedImages.filter(f => f !== file);
                    previewDiv.remove();
                };

                previewDiv.appendChild(img);
                previewDiv.appendChild(btn);
                previewContainer.appendChild(previewDiv);

                uploadedImages.push(file);
            });

            event.target.value = '';
        });
    }

    // -----------------------------
    // CATEGORY CHANGE
    // -----------------------------
    const categorySelect = document.getElementById('ad-category');

    if (categorySelect) {
        categorySelect.addEventListener('change', function () {
            showCarFields(this.value);
            hideConditionIfNeeded(this.value);
        });
    }

    // -----------------------------
    // PAYPAL
    // -----------------------------
    const paypalContainer = document.getElementById('paypal-button-container');

    document.querySelectorAll('input[name="featured"]').forEach(radio => {
        radio.addEventListener('change', function () {
            if (paypalContainer) {
                paypalContainer.style.display = (this.value !== 'none') ? 'block' : 'none';
            }
        });
    });

    if (typeof paypal !== 'undefined' && paypalContainer) {
        paypal.Buttons({
            createOrder: (data, actions) => {
                return actions.order.create({
                    purchase_units: [{
                        amount: { value: '5.00' }
                    }]
                });
            },
            onApprove: (data, actions) => {
                return actions.order.capture().then(() => {
                    paypalPaid = true;
                    alert("Payment successful!");
                });
            }
        }).render('#paypal-button-container');
    }

    // -----------------------------
    // SUBMIT FORM
    // -----------------------------
    const postForm = document.getElementById('post-ad-form');
    if (postForm) {
        postForm.addEventListener('submit', postAd);
    }

});
