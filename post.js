// Handle the form submission for posting an ad
function submitAd(event) {
    event.preventDefault();

    // Get ad details from the form
    const adTitle = document.getElementById('ad-title').value;
    const adDescription = document.getElementById('ad-description').value;
    const adCategory = document.getElementById('ad-category').value;
    const adPrice = document.getElementById('ad-price').value;
    const adLocation = document.getElementById('ad-location').value;
    const adImage = document.getElementById('ad-image').files[0]; // Handle image upload (optional)
    const adCondition = document.querySelector('input[name="condition"]:checked')?.value || 'N/A';

    // Create a unique ID for the ad
    const adId = new Date().toISOString(); // You can use a better ID generator if needed

    // Handle car details if the category is "Cars & Trucks"
    let carDetails = {};
    if (adCategory === "Cars & Trucks") {
        carDetails = {
            year: document.getElementById('car-year').value,
            make: document.getElementById('car-make').value,
            model: document.getElementById('car-model').value,
            kms: document.getElementById('car-kms').value,
            fuel: document.getElementById('car-fuel').value
        };
    }

    // Handle PayPal featured ads option
    const featured = document.querySelector('input[name="featured"]:checked')?.value || 'none';

    // Create the ad object
    const ad = {
        id: adId,
        title: adTitle,
        description: adDescription,
        category: adCategory,
        price: adPrice,
        location: adLocation,
        imageUrl: adImage ? URL.createObjectURL(adImage) : '', // Image URL if provided
        condition: adCondition,
        featured: featured,
        carDetails: carDetails
    };

    // Save the ad to localStorage (or to Firebase/Backend)
    let ads = JSON.parse(localStorage.getItem('ads')) || [];
    ads.push(ad);
    localStorage.setItem('ads', JSON.stringify(ads));

    // Show success message and reset form
    alert('Your ad has been posted successfully!');
    document.getElementById('post-ad-form').reset();
}

// Handle the photo upload and display preview
let uploadedImages = [];

window.handlePhotoUpload = function (event) {
    const files = Array.from(event.target.files || []);
    const preview = document.getElementById("galleryPreview");

    if (!preview || !files.length) return;

    const progressBar = document.getElementById("progressBar");
    const uploadProgress = document.getElementById("uploadProgress");
    uploadProgress.style.display = "block";

    let uploadedCount = 0;
    const totalFiles = files.length;

    files.forEach((file) => {
        const imgContainer = document.createElement("div");
        imgContainer.classList.add("image-container"); // Styling for individual images

        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);  // Preview image before upload
        img.style.width = "100px";
        img.style.height = "100px";
        img.style.objectFit = "cover";
        imgContainer.appendChild(img);

        const deleteIcon = document.createElement("span");
        deleteIcon.classList.add("delete-icon");
        deleteIcon.innerHTML = "X";
        deleteIcon.onclick = function () {
            imgContainer.remove();
            const index = uploadedImages.indexOf(file);
            if (index > -1) {
                uploadedImages.splice(index, 1);
            }
        };
        imgContainer.appendChild(deleteIcon);

        preview.appendChild(imgContainer);

        uploadedImages.push(file);
        uploadedCount++;
        if (uploadedCount === totalFiles) {
            uploadProgress.style.display = "none";
        }
    });

    event.target.value = "";
};

// Function to render PayPal button for payment
document.addEventListener("DOMContentLoaded", function () {
    const paypalButtonContainer = document.getElementById("paypal-button-container");
    let paypalButtonRendered = false;

    // Function to render PayPal button
    function renderPaypalButton(price) {
        if (!paypalButtonRendered) {
            paypal.Buttons({
                createOrder: function (data, actions) {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: price // Dynamically set price for the ad
                            }
                        }]
                    });
                },
                onApprove: function (data, actions) {
                    return actions.order.capture().then(function (details) {
                        alert("Payment completed for " + details.payer.name.given_name);
                        // Once payment is successful, proceed with the form submission
                        submitAd(event); // Call submitAd after PayPal payment is successful
                    });
                },
                onError: function (err) {
                    console.error("PayPal Payment Error", err);
                    alert("Payment failed. Please try again.");
                }
            }).render("#paypal-button-container");
            paypalButtonRendered = true;
        }
    }

    // Checkboxes event listeners for PayPal button based on user selection
    const featured5DaysCheckbox = document.getElementById("isFeatured5Days");
    const featured10DaysCheckbox = document.getElementById("isFeatured10Days");

    // Check if the PayPal button should be shown or hidden based on checkbox selection
    featured5DaysCheckbox.addEventListener("change", function () {
        if (this.checked) {
            renderPaypalButton(4.99);  // 5 days price
        } else {
            paypalButtonContainer.style.display = "none";
        }
    });

    featured10DaysCheckbox.addEventListener("change", function () {
        if (this.checked) {
            renderPaypalButton(8.99);  // 10 days price
        } else {
            paypalButtonContainer.style.display = "none";
        }
    });
});

// Show/hide condition field based on category
document.getElementById('ad-category').addEventListener('change', function () {
    const category = this.value;
    const conditionField = document.getElementById('condition-field');
    const carFields = document.getElementById('car-info');

    if (["Pets", "Real Estate", "Jobs", "Services"].includes(category)) {
        conditionField.style.display = "none";
    } else {
        conditionField.style.display = "block";
    }

    if (category === "Cars & Trucks") {
        carFields.style.display = "block";
    } else {
        carFields.style.display = "none";
    }
});






