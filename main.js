
/* --- 1. CONFIGURATION & HELPERS --- */
const currentUser = JSON.parse(localStorage.getItem("currentUser"));


function getAds() {
   // Standardized to use the 'ads' key used in your post.js
   return JSON.parse(localStorage.getItem("ads") || "[]");
}


function saveAds(adsArray) {
   localStorage.setItem("ads", JSON.stringify(adsArray));
}


/* --- 2. NAVIGATION & AUTH ACTIONS --- */
function goToDetails(id) {
   window.location.href = `details.html?id=${id}`;
}


function editAd(id) {
   window.location.href = `post.html?id=${id}`;
}


function deleteAd(id) {
   if (confirm("Are you sure you want to delete this ad?")) {
       let ads = getAds();  // Get all ads from localStorage
       ads = ads.filter(ad => ad.id !== id);  // Remove the ad with the matching id
       saveAds(ads);  // Save the updated ads list back to localStorage
       location.reload();  // Reload the page to update the UI
   }
}


function toggleStatus(id) {
   let ads = getAds();
   const index = ads.findIndex(ad => ad.id === id);
   if (index !== -1) {
       ads[index].status = ads[index].status === "Sold" ? "Active" : "Sold";
       saveAds(ads);
       location.reload();
   }
}


function logout() {
   localStorage.removeItem("currentUser");
   window.location.href = "index.html";
}


/* --- 3. UI RENDERING --- */
function renderAds(adsArray, containerId = "listings") {
   const container = document.getElementById(containerId);
   if (!container) return;


   container.innerHTML = "";
   const isMyAdsPage = (containerId === "myAds");


   if (!adsArray || adsArray.length === 0) {
       container.innerHTML = "<p class='no-ads'>No items found.</p>";
       return;
   }


   container.innerHTML = adsArray.map(ad => {
       const isSold = ad.status === 'Sold';
       const isFeatured = ad.isFeatured === true;
      
       
// Bulletproof Image Logic
       // 1. SAFE IMAGE SHIELD
let displayImage = 'https://placeholder.com';  // Default if no image found

if (ad && ad.image) {
    // Check if it's an array with at least one photo
    if (Array.isArray(ad.image) && ad.image.length > 0) {
        displayImage = ad.image[0];  // Use the first image if it's an array
    }
    // Check if it's just a single string (URL or Base64)
    else if (typeof ad.image === 'string' && ad.image.length > 5) {
        displayImage = ad.image;  // Use the image URL or base64 string
    }
}



       return `
           <div class="card ${isFeatured ? 'featured-card' : ''} ${isSold ? 'sold-card' : ''}"
                onclick="${isMyAdsPage ? '' : `goToDetails(${ad.id})`}"
                style="cursor:pointer; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; background: white; margin-bottom: 15px; position: relative;">
              
               ${isFeatured ? '<div class="featured-badge" style="position: absolute; top: 10px; left: 10px; background: gold; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; z-index: 10;">✨ FEATURED</div>' : ''}
               ${isSold ? '<div class="sold-badge" style="position: absolute; top: 10px; right: 10px; background: red; color: white; padding: 2px 8px; z-index: 10; font-weight: bold;">SOLD</div>' : ''}


               <div class="card-img-wrapper" style="height:180px; width: 100%; overflow:hidden; background-color: #f0f0f0;">
                   <img src="${displayImage}" alt="${ad.title}" style="width:100%; height:100%; object-fit: cover; display: block;">
               </div>
              
               <div class="ad-content" style="padding: 15px;">
                   <span class="category-tag" style="font-size: 0.8rem; color: #666; font-weight: bold; text-transform: uppercase;">${ad.category || "General"}</span>
                   <h3 style="margin: 5px 0;">${ad.title || "Untitled"}</h3>
                   <p style="margin: 5px 0; color: #007bff;"><strong>$${ad.price || "0"}</strong></p>
                   <p style="font-size: 0.9rem; color: #555;">📍 ${ad.location || "Local"}</p>
                  
                   ${isMyAdsPage ? `
                       <div class="actions" style="margin-top:10px; display: flex; gap: 8px;">
                           <button onclick="event.stopPropagation(); toggleStatus(${ad.id})" class="btn-sm" style="cursor:pointer; padding: 5px;">Status</button>
                           <button onclick="event.stopPropagation(); editAd(${ad.id})" class="btn-sm" style="cursor:pointer; padding: 5px;">Edit</button>
                           <button onclick="event.stopPropagation(); deleteAd(${ad.id})" class="btn-sm btn-delete" style="cursor:pointer; padding: 5px; color: red;">Delete</button>
                       </div>
                   ` : ""}
               </div>
           </div>
       `;
   }).join('');
}

function applyFilters() {
   // 1. Get the inputs (safe check to make sure they exist)
   const searchInput = document.getElementById('search');
   const locationInput = document.getElementById('filterLocation');
  
   if (!searchInput || !locationInput) return; // Stop if the boxes aren't found


   const searchQuery = searchInput.value.toLowerCase().trim();
   const locationQuery = locationInput.value.toLowerCase().trim();

  
   // 2. Pull ads from the 'ads' key we standardized
   const allAds = JSON.parse(localStorage.getItem("ads") || "[]");


   // 3. Filter with case-insensitivity
   const filtered = allAds.filter(ad => {
       // We convert the ad's data to lowercase here so 'iPhone' matches 'iphone'
       const adTitle = (ad.title || "").toLowerCase();
       const adLocation = (ad.location || "").toLowerCase();


       const matchesTitle = adTitle.includes(searchQuery);
       const matchesLocation = adLocation.includes(locationQuery);
      
       // Keep active ads that match both boxes
       return matchesTitle && matchesLocation && ad.status !== "Sold";
   });


   // 4. Sort: Featured ads first (so your paid feature keeps working!)
   filtered.sort((a, b) => (b.isFeatured === a.isFeatured) ? 0 : b.isFeatured ? 1 : -1);


   // 5. Update the Title on the page
   const viewTitle = document.getElementById("viewTitle");
   if (viewTitle) {
       viewTitle.innerText = (searchQuery || locationQuery) ? "Search Results" : "Recent Listings";
   }


   // 6. Draw the results
   renderAds(filtered, "listings");
}


function filterByCategory(categoryName) {
   // 1. Get the ads from the correct 'ads' key
   const allAds = JSON.parse(localStorage.getItem("ads") || "[]");
  
   // 2. Filter by category
   const filtered = allAds.filter(ad => {
       const adCat = (ad.category || "").toLowerCase();
       const targetCat = categoryName.toLowerCase();
      
       // Match the "Vehicles" icon to the "Cars & Trucks" data
       if (targetCat === "vehicles") return adCat === "cars & trucks";
      
       // Match everything else
       return adCat === targetCat;
   });


   // 3. Keep Featured ads at the top of the category
   filtered.sort((a, b) => (b.isFeatured === a.isFeatured) ? 0 : b.isFeatured ? 1 : -1);
  
   // 4. Update the heading and show the ads
   const viewTitle = document.getElementById("viewTitle");
   if (viewTitle) viewTitle.innerText = "Category: " + categoryName;
  
   renderAds(filtered, "listings");
}



// Language Switch Function
function changeLanguage(lang) {
    // Save the selected language to localStorage
    localStorage.setItem("language", lang);

    // Reload the page to apply the language change
    window.location.reload();
}


/* --- 5. INITIALIZATION --- */
function updateHeader() {
   const userAuth = document.getElementById("userAuth");
   if (userAuth && currentUser) {
       userAuth.innerHTML = `<span class="user-email">Hi, ${currentUser.email.split('@')[0]}</span>`;
   }
}


window.onload = () => {
   updateHeader();


   // Home Page Logic
   if (document.getElementById("listings")) {
       const allAds = getAds();
       const activeAds = allAds.filter(ad => ad.status !== "Sold");
       activeAds.sort((a, b) => (b.isFeatured === a.isFeatured) ? 0 : b.isFeatured ? 1 : -1);
       renderAds(activeAds, "listings");
   }


   // My Ads Page Logic
   if (document.getElementById("myAds")) {
       if (!currentUser) {
           document.getElementById("myAds").innerHTML = "<p>Please <a href='login.html'>Login</a> to see your ads.</p>";
       } else {
           const userAds = getAds().filter(ad => ad.userEmail === currentUser.email);
           renderAds(userAds, "myAds");
       }
   }
};


function adminLogin() {
   const pass = prompt("Enter Admin Password:");


   if (pass !== "your-password") {
       alert("Access Denied");
       return;
   }


   // Once password is correct, check if the user is an admin
   checkAdminAccess();
}


// This function already exists in your admin.js
function checkAdminAccess() {
   const isAdmin = localStorage.getItem("isAdmin");


   if (isAdmin !== "true") {
       alert("Access Denied");
       window.location.href = "index.html";  // Redirect if not an admin
   } else {
       // Allow access and load admin resources
       window.location.href = "admin.html";  // Assuming admin page is called admin.html
   }
}
document.addEventListener("DOMContentLoaded", () => {
    const savedLanguage = localStorage.getItem("language") || "en";  // Default to 'en' if no language is set

});


    
