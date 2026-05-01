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

// Handle the PayPal button and its rendering
document.addEventListener("DOMContentLoaded", function () {
    const paypalButtonContainer = document.getElementById("paypal-button-container");
    let paypalButtonRendered = false;

    // Function to render the PayPal button
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
                        // Once payment is successful, submit the form
                        submitAd(event);
                    });
                },
                onError: function (err) {
                    console.error("PayPal Payment Error", err);
                    alert("Payment failed. Please try again.");
                }
            }).render("#paypal-button-container"); // Render PayPal button inside this container
            paypalButtonRendered = true;
        }
    }

    // Checkboxes event listeners for PayPal button based on user selection
    const featured5DaysRadio = document.getElementById("isFeatured5Days");
    const featured10DaysRadio = document.getElementById("isFeatured10Days");
    const notFeaturedRadio = document.getElementById("isNotFeatured");

    // Show PayPal button when 5-day feature is selected
    featured5DaysRadio.addEventListener("change", function () {
        if (this.checked) {
            paypalButtonContainer.style.display = "block";  // Show the button container
            renderPaypalButton(4.99);  // Price for 5 days
        }
    });

    // Show PayPal button when 10-day feature is selected
    featured10DaysRadio.addEventListener("change", function () {
        if (this.checked) {
            paypalButtonContainer.style.display = "block";  // Show the button container
            renderPaypalButton(8.99);  // Price for 10 days
        }
    });

    // Hide PayPal button when "Do not feature" option is selected
    notFeaturedRadio.addEventListener("change", function () {
        if (this.checked) {
            paypalButtonContainer.style.display = "none";  // Hide the PayPal button container
        }
    });
});






