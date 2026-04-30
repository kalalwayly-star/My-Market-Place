// Handle the form submission for posting an ad
function submitAd(event) {
    event.preventDefault();

    // Get ad details from the form
    const adTitle = document.getElementById('ad-title').value;
    const adDescription = document.getElementById('ad-description').value;
    const adCategory = document.getElementById('ad-category').value;
    const adPrice = document.getElementById('ad-price').value;
    const adImage = document.getElementById('ad-image').files[0]; // Handle image upload (optional)

    // Create a unique ID for the ad
    const adId = new Date().toISOString(); // You can use a better ID generator if needed

    // Create the ad object
    const ad = {
        id: adId,
        title: adTitle,
        description: adDescription,
        category: adCategory,
        price: adPrice,
        imageUrl: adImage ? URL.createObjectURL(adImage) : '', // Image URL if provided
    };

    // Save the ad to localStorage
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

        // If uploading images to storage was part of your functionality, you can use the code here.
        // For simplicity, we are skipping this part here.
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
                        submitAd(event);
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






