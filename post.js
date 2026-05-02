// Initialize the uploadedImages array globally to store uploaded images
let uploadedImages = [];

// Function to post a new ad
function postAd() {
    // Get the input values from the form
    const title = document.getElementById('adTitle').value.trim();
    const description = document.getElementById('adDescription').value.trim();
    const price = document.getElementById('adPrice').value.trim();
    const location = document.getElementById('adLocation').value.trim();
    const condition = document.querySelector('input[name="condition"]:checked').value;
    const featuredAd = document.querySelector('input[name="featured"]:checked')?.value || 'none';  // If no option is checked, set default
    const user = JSON.parse(localStorage.getItem('loggedInUser'));

    // Validation: Make sure the user is logged in
    if (!user) {
        alert('You must be logged in to post an ad!');
        return;
    }

    // Validation: Make sure all required fields are filled in
    if (!title || !description || !price || !location) {
        alert('Please fill in all the required fields.');
        return;
    }

    // Create a new ad object
    const newAd = {
        id: Date.now().toString(), // Use current timestamp as unique id
        title,
        description,
        price,
        location,
        condition,
        featuredAd,
        userId: user.email, // Store the user's email with the ad
    };

    // Retrieve existing ads from localStorage
    const ads = JSON.parse(localStorage.getItem('ads')) || [];
    ads.push(newAd);  // Add the new ad to the ads array

    // Save the updated ads array to localStorage
    localStorage.setItem('ads', JSON.stringify(ads));

    alert('Your ad has been posted successfully!'); // Show success message

    // Redirect to My Ads page after posting the ad
    window.location.href = 'myads.html';
}

// Event listener for the Post Ad button
document.getElementById('postAdButton').addEventListener('click', postAd);

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

// Handle the PayPal button and its rendering for featured ads
document.addEventListener("DOMContentLoaded", function () {
    const paypalButtonContainer = document.getElementById("paypal-button-container");
    const featured5DaysRadio = document.getElementById("isFeatured5Days");
    const featured10DaysRadio = document.getElementById("isFeatured10Days");
    const notFeaturedRadio = document.getElementById("isNotFeatured");

    // Function to render the PayPal button
    function renderPaypalButton(price) {
        if (window.paypal && window.paypal.Buttons) {
            paypal.Buttons({
                createOrder: function (data, actions) {
                    return actions.order.create({
                        purchase_units: [{
                            amount: { value: price }
                        }]
                    });
                },
                onError: function (err) {
                    console.error("PayPal Payment Error", err);
                    alert("Payment failed. Please try again.");
                }
            }).render("#paypal-button-container");
        } else {
            console.error("PayPal SDK not loaded yet.");
            // Optional: Retry after a short delay
            setTimeout(() => renderPaypalButton(price), 100);
        }
    }

    // Handle radio button changes for featured options
    featured5DaysRadio.addEventListener("change", function () {
        if (this.checked) {
            paypalButtonContainer.style.display = "block";
            renderPaypalButton(4.99); // Price for 5 days
        }
    });

    featured10DaysRadio.addEventListener("change", function () {
        if (this.checked) {
            paypalButtonContainer.style.display = "block";
            renderPaypalButton(8.99); // Price for 10 days
        }
    });

    notFeaturedRadio.addEventListener("change", function () {
        if (this.checked) {
            paypalButtonContainer.style.display = "none";
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
