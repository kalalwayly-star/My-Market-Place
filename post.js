// Initialize the uploadedImages array globally to store uploaded images
let uploadedImages = [];

// Handle the form submission for posting an ad
function submitAd(event) {
    event.preventDefault();  // Prevent page reload on form submission

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

    // Show success message
    alert('Your ad has been posted successfully!');

    // Redirect to home page (change the URL if needed)
    window.location.href = "index.html"; // Redirect to home page (index.html)
}

// Clear the form fields after submission
function clearForm() {
    document.getElementById('post-ad-form').reset(); // Reset the form
}

// Handle the photo upload and display preview
document.getElementById('ad-image').addEventListener('change', function (event) {
    const files = Array.from(event.target.files || []);
    const previewContainer = document.getElementById('image-previews');
    
    if (!previewContainer || !files.length) return;

    // Limit the number of images to 6
    if (uploadedImages.length + files.length > 6) {
        alert('You can upload up to 6 images only.');
        return;
    }

    files.forEach((file) => {
        // Prevent duplicate uploads
        if (uploadedImages.includes(file)) {
            alert('This image is already uploaded.');
            return;
        }

        const previewDiv = document.createElement('div');
        previewDiv.classList.add('image-preview');
        
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file); // Preview image before upload
        previewDiv.appendChild(img);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.textContent = 'X';
        deleteBtn.onclick = function () {
            const index = uploadedImages.indexOf(file);
            if (index > -1) {
                uploadedImages.splice(index, 1);
            }
            previewDiv.remove(); // Remove the image preview from the DOM
        };
        previewDiv.appendChild(deleteBtn);

        previewContainer.appendChild(previewDiv);

        // Add to the uploaded images array
        uploadedImages.push(file);
    });

    // Clear input value after preview
    event.target.value = '';
});

// Handle the PayPal button and its rendering
document.addEventListener("DOMContentLoaded", function () {
    const paypalButtonContainer = document.getElementById("paypal-button-container");
    const featured5DaysRadio = document.getElementById("isFeatured5Days");
    const featured10DaysRadio = document.getElementById("isFeatured10Days");
    const notFeaturedRadio = document.getElementById("isNotFeatured");

    // Function to render the PayPal button
    function renderPaypalButton(price) {
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
                    submitAd(event);  // Make sure submitAd is defined
                });
            },
            onError: function (err) {
                console.error("PayPal Payment Error", err);
                alert("Payment failed. Please try again.");
            }
        }).render("#paypal-button-container"); // Render PayPal button inside this container
    }

    // Handle radio button changes for featured options
    featured5DaysRadio.addEventListener("change", function () {
        if (this.checked) {
            paypalButtonContainer.style.display = "block";  // Show the PayPal button container
            renderPaypalButton(4.99);  // Price for 5 days
        }
    });

    featured10DaysRadio.addEventListener("change", function () {
        if (this.checked) {
            paypalButtonContainer.style.display = "block";  // Show the PayPal button container
            renderPaypalButton(8.99);  // Price for 10 days
        }
    });

    notFeaturedRadio.addEventListener("change", function () {
        if (this.checked) {
            paypalButtonContainer.style.display = "none";  // Hide the PayPal button container
        }
    });
});

// Populate Car Details Dropdowns (Year, Make, Model)
document.addEventListener("DOMContentLoaded", function() {
    const yearSelect = document.getElementById("car-year");
    const makeSelect = document.getElementById("car-make");
    const modelSelect = document.getElementById("car-model");

    // Populate Year Dropdown (2001 to current year)
    const currentYear = new Date().getFullYear();
    for (let year = 2001; year <= currentYear; year++) {
        const option = document.createElement("option");
        option.value = year;
        option.text = year;
        yearSelect.appendChild(option);
    }

    // Add sample Make dropdown options (add your actual makes)
    const makes = ["Toyota", "Honda", "Ford", "BMW", "Mercedes"];
    makes.forEach(make => {
        const option = document.createElement("option");
        option.value = make;
        option.text = make;
        makeSelect.appendChild(option);
    });

    // Add sample Model dropdown options (add your actual models)
    makeSelect.addEventListener("change", function() {
        modelSelect.innerHTML = ''; // Reset model options

        const selectedMake = makeSelect.value;
        let models = [];

        // Sample logic to update model options based on selected make
        if (selectedMake === "Toyota") {
            models = ["Corolla", "Camry", "Hilux"];
        } else if (selectedMake === "Honda") {
            models = ["Civic", "Accord", "CR-V"];
        } else if (selectedMake === "Ford") {
            models = ["Focus", "Fiesta", "Mustang"];
        }

        models.forEach(model => {
            const option = document.createElement("option");
            option.value = model;
            option.text = model;
            modelSelect.appendChild(option);
        });
    });
});
