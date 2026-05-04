document.addEventListener('DOMContentLoaded', function () {

    let uploadedImages = [];
    let paypalPaid = false;

    const form = document.getElementById('post-ad-form');
    const categorySelect = document.getElementById('ad-category');
    const imageInput = document.getElementById('ad-image');
    const previewContainer = document.getElementById('image-previews');
    const paypalContainer = document.getElementById('paypal-button-container');

    // -----------------------------
    // CATEGORY CONFIG
    // -----------------------------

    function getMaxImages(category) {
        const highLimit = ["Cars", "Cars & Trucks", "Real Estate"];
        return highLimit.includes(category) ? 6 : 3;
    }

    function showCarFields(category) {
        const carInfo = document.getElementById('car-info');
        if (!carInfo) return;

        const isCar = category === "Cars" || category === "Cars & Trucks";
        carInfo.style.display = isCar ? "block" : "none";
    }

    function hideConditionIfNeeded(category) {
        const condition = document.getElementById('condition-field');
        if (!condition) return;

        const hideFor = ["Jobs", "Services", "Real Estate", "Business"];

        condition.style.display = hideFor.includes(category)
            ? "none"
            : "block";
    }

    function updateImageHint(category) {
        const hint = document.getElementById("image-limit-hint");
        if (!hint) return;

        const max = getMaxImages(category);
        hint.innerText = `You can upload up to ${max} images`;
    }

    function handleCategoryChange() {
        const category = categorySelect.value;

        showCarFields(category);
        hideConditionIfNeeded(category);
        updateImageHint(category);
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategoryChange);
        handleCategoryChange(); // run on load
    }

    // -----------------------------
    // IMAGE UPLOAD (FIXED LIMIT)
    // -----------------------------

    if (imageInput) {
        imageInput.addEventListener('change', function (event) {

            const files = Array.from(event.target.files || []);
            const category = categorySelect.value;
            const maxImages = getMaxImages(category);

            if (!previewContainer) return;

            if (uploadedImages.length + files.length > maxImages) {
                alert(`You can upload up to ${maxImages} images only.`);
                return;
            }

            files.forEach(file => {

                const reader = new FileReader();

                reader.onload = function (e) {

                    const previewDiv = document.createElement('div');
                    previewDiv.className = 'image-preview';

                    const img = document.createElement('img');
                    img.src = e.target.result;

                    const btn = document.createElement('button');
                    btn.type = "button";
                    btn.textContent = "X";

                    btn.onclick = function () {
                        uploadedImages = uploadedImages.filter(f => f !== file);
                        previewDiv.remove();
                    };

                    previewDiv.appendChild(img);
                    previewDiv.appendChild(btn);

                    previewContainer.appendChild(previewDiv);
                    uploadedImages.push(file);
                };

                reader.readAsDataURL(file);
            });

            event.target.value = '';
        });
    }

    // -----------------------------
    // SAVE AD
    // -----------------------------

    function saveAd(data) {
        const ads = JSON.parse(localStorage.getItem('ads') || "[]");

        ads.push(data);

        localStorage.setItem('ads', JSON.stringify(ads));

        alert("Ad posted successfully!");

        window.location.href = "myads.html";
    }

    function postAd(e) {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");

        if (!user) {
            alert("Please login first!");
            return;
        }

        const title = document.getElementById('ad-title').value.trim();
        const description = document.getElementById('ad-description').value.trim();
        const price = document.getElementById('ad-price').value.trim();
        const location = document.getElementById('ad-location').value.trim();
        const category = categorySelect.value;

        if (!title || !price || !category) {
            alert("Please fill required fields");
            return;
        }

        const images = [];

        const promises = uploadedImages.map(file => {
            return new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(promises).then(results => {

            const newAd = {
                id: Date.now().toString(),
                title,
                description,
                price,
                location,
                category,
                images: results,
                userEmail: user.email,
                date: new Date().toLocaleString(),
                featured: paypalPaid ? "featured" : "normal"
            };

            saveAd(newAd);
        });
    }

    if (form) {
        form.addEventListener('submit', postAd);
    }

    // -----------------------------
    // PAYPAL (SAFE INIT)
    // -----------------------------

    function initPayPal() {
        if (!paypalContainer) return;
        if (typeof paypal === "undefined") return;

        try {
            document.querySelectorAll('input[name="featured"]').forEach(radio => {

                radio.addEventListener("change", function () {

                    if (this.value !== "none") {
                        paypalContainer.style.display = "block";

                        paypalContainer.innerHTML = `
                            <a href="https://www.paypal.com/ncp/payment/J2JFQFB2TYJC8"
                               target="_blank"
                               style="display:block;padding:12px;background:#ffc439;text-align:center;font-weight:bold;border-radius:8px;">
                               Pay Featured Ad
                            </a>

                            <button type="button" id="confirmPay"
                                style="width:100%;margin-top:10px;padding:10px;background:#28a745;color:white;border:none;">
                                I Have Paid
                            </button>
                        `;

                        document.getElementById("confirmPay").onclick = function () {
                            paypalPaid = true;
                            alert("Payment confirmed!");
                        };

                    } else {
                        paypalContainer.style.display = "none";
                        paypalContainer.innerHTML = "";
                        paypalPaid = false;
                    }
                });
            });

        } catch (e) {
            console.error("PayPal error:", e);
        }
    }

    window.addEventListener("load", initPayPal);

});
