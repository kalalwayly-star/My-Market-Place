document.addEventListener('DOMContentLoaded', function () {
    let uploadedImages = [];
    let paypalPaid = false;

    // --- MAIN POST FUNCTION ---
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
            alert('Please fill in Title, Price, and Category.');
            return;
        }

        // Require PayPal payment for featured ads
        if (featuredOption !== 'none' && !paypalPaid) {
            alert('Please complete PayPal payment for featured ads before posting.');
            return;
        }

        if (uploadedImages.length === 0) {
            saveAd(title, description, price, location, category, [], user, featuredOption);
        } else {
            const readers = uploadedImages.map(file => {
                return new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(readers).then(imageUrls => {
                saveAd(title, description, price, location, category, imageUrls, user, featuredOption);
            });
        }
    }

    // --- SAVE AD ---
    function saveAd(title, description, price, location, category, imageUrls, user, featuredOption) {
        const newAd = {
            id: Date.now().toString(),
            title,
            description,
            price,
            location,
            category,
            images: imageUrls,
            image: imageUrls[0] || '',
            userId: user.email,
            userEmail: user.email,
            featured: featuredOption,
            date: new Date().toLocaleDateString(),
            createdAt: new Date().toISOString()
        };

        const ads = JSON.parse(localStorage.getItem('ads') || '[]');
        ads.push(newAd);
        localStorage.setItem('ads', JSON.stringify(ads));

        alert('Ad Posted Successfully!');

        setTimeout(() => {
            window.location.href = 'myads.html';
        }, 500);
    }

    // --- IMAGE UPLOAD ---
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

            files.forEach(file => {
                const previewDiv = document.createElement('div');
                previewDiv.className = 'image-preview';

                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.style.maxWidth = '120px';
                img.style.margin = '5px';
                previewDiv.appendChild(img);

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'X';
                deleteBtn.type = 'button';
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

    // --- CATEGORY EXTRA FIELDS ---
    const categorySelect = document.getElementById('ad-category');
    const carInfo = document.getElementById('car-info');

    if (categorySelect && carInfo) {
        categorySelect.addEventListener('change', function () {
            carInfo.style.display = (this.value === 'Cars & Trucks') ? 'block' : 'none';
        });
    }

    // --- FEATURED AD + PAYPAL DISPLAY ---
    const paypalContainer = document.getElementById('paypal-button-container');

    document.querySelectorAll('input[name="featured"]').forEach(radio => {
        radio.addEventListener('change', function () {
            if (paypalContainer) {
                paypalContainer.style.display = (this.value !== 'none') ? 'block' : 'none';
            }
        });
    });

    // --- PAYPAL INTEGRATION ---
    if (typeof paypal !== 'undefined' && paypalContainer) {
        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: '5.00'
                        },
                        description: 'Featured Ad Upgrade'
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    paypalPaid = true;
                    alert('Payment completed by ' + details.payer.name.given_name + '! You can now post your featured ad.');
                });
            },
            onError: function(err) {
                console.error('PayPal Error:', err);
                alert('PayPal payment failed. Please try again.');
            }
        }).render('#paypal-button-container');
    }

    // --- FORM SUBMIT ---
    const postForm = document.getElementById('post-ad-form');
    if (postForm) {
        postForm.addEventListener('submit', postAd);
    }
});

