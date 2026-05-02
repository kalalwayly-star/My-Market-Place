document.addEventListener('DOMContentLoaded', function() {
    // Initialize the uploadedImages array globally to store uploaded images
    let uploadedImages = [];

   // Function to post a new ad
function postAd(event) {
    if (event) event.preventDefault(); // Stop the page from refreshing

    // FIX: IDs must match the HTML exactly (ad-title vs adTitle)
    const title = document.getElementById('ad-title').value.trim();
    const description = document.getElementById('ad-description').value.trim();
    const price = document.getElementById('ad-price').value.trim();
    const location = document.getElementById('ad-location').value.trim();
    const category = document.getElementById('ad-category').value;
    
    // Safety check for radio buttons
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

    // Create the ad object
    const newAd = {
        id: Date.now().toString(),
        title,
        description,
        price,
        location,
        category,
        featuredAd,
        userId: user.email,
        images: [] // Note: Storing actual image files in LocalStorage is complex due to size limits
    };

    // Save to LocalStorage
    const ads = JSON.parse(localStorage.getItem('ads')) || [];
    ads.push(newAd);
    localStorage.setItem('ads', JSON.stringify(ads));

    alert('Your ad has been posted successfully!');
    window.location.href = 'myads.html';
}

// FIX: Change the event listener to match your HTML form submission
document.addEventListener('DOMContentLoaded', function() {
    const postForm = document.getElementById('post-ad-form');
    if (postForm) {
        postForm.addEventListener('submit', postAd);
    }
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
// Event listener for the Post Ad button
const postAdButton = document.getElementById('postAdButton');
if (postAdButton) {
    postAdButton.addEventListener('click', function(event) {
        event.preventDefault(); // This stops the page from reloading
        postAd() ;
    });
}
