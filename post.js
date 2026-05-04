document.addEventListener('DOMContentLoaded', function () {

    let uploadedImages = [];
    let paypalPaid = false;

    // -----------------------------
    // CATEGORY RULES
    // -----------------------------
   function getMaxImages(category) {
    const highImageCategories = ["Cars", "Cars & Trucks", "Real Estate"];

    if (highImageCategories.includes(category)) {
        return 6;
    }

    return 3;
}

function showCarFields(category) {
    const carInfo = document.getElementById('car-info');
    if (!carInfo) return;

    const isCarCategory = category === "Cars" || category === "Cars & Trucks";

    carInfo.style.display = isCarCategory ? "block" : "none";
}

function hideConditionIfNeeded(category) {
    const condition = document.getElementById('condition-field');
    if (!condition) return;

    // categories where condition should NOT appear
    const hideFor = [
        "Jobs",
        "Services",
        "Real Estate",
        "Business"
    ];

    if (hideFor.includes(category)) {
        condition.style.display = "none";
    } else {
        condition.style.display = "block";
    }
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

            featured: featuredOption !== 'none',
featuredType: featuredOption,
featuredUntil: featuredOption !== 'none'
    ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    : null,

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
    radio.addEventListener("change", function () {
        if (!paypalContainer) return;

        if (this.value !== "none") {
            paypalContainer.style.display = "block";

            paypalContainer.innerHTML = `
                <div id="paypal-container-J2JFQFB2TYJC8"></div>
            `;

            if (!paypalContainer.dataset.loaded && typeof paypal !== "undefined") {
                paypalContainer.dataset.loaded = "true";

                paypal.HostedButtons({
                    hostedButtonId: "J2JFQFB2TYJC8"
                }).render("#paypal-container-J2JFQFB2TYJC8");

                // Auto mark payment success after return
                paypalPaid = true;
            }

        } else {
            paypalContainer.style.display = "none";
            paypalContainer.innerHTML = "";
            paypalContainer.dataset.loaded = "";
            paypalPaid = false;
        }
    });
});
    // -----------------------------
    // SUBMIT FORM
    // -----------------------------
    const postForm = document.getElementById('post-ad-form');
    if (postForm) {
        postForm.addEventListener('submit', postAd);
    }

});
