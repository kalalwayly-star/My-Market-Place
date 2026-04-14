// details.js
function getAdIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id'); // Change 'id' to match your URL parameter name
}

// 1. Get the ID from the URL
const params = new URLSearchParams(window.location.search);
const adId = Number(params.get("id"));

let ad; // Global variable to hold the current ad data

window.onload = function() {
    if (!adId) {
        window.location.href = "index.html";
        return;
    }

    // Load ads from the standardized 'ads' key
    const ads = JSON.parse(localStorage.getItem("ads") || "[]");
    ad = ads.find(item => item.id === adId);

    if (ad) {
        // --- DISPLAY TEXT DATA ---
        if(document.getElementById("adTitle")) document.getElementById("adTitle").innerText = ad.title;
        if(document.getElementById("adPrice")) document.getElementById("adPrice").innerText = `$${ad.price}`;
        if(document.getElementById("adCategory")) document.getElementById("adCategory").innerText = ad.category;
        if(document.getElementById("adLocation")) document.getElementById("adLocation").innerText = ad.location || "Local";
        if(document.getElementById("adDesc")) document.getElementById("adDesc").innerText = ad.description || "No description provided.";

        // --- IMAGE HANDLING FOR MULTIPLE PHOTOS ---
        const imgContainer = document.getElementById("adImageContainer");
        if (imgContainer) {
            // Force data into an array format
            let photoList = [];
            if (Array.isArray(ad.image)) {
                photoList = ad.image;
            } else if (ad.image) {
                photoList = [ad.image];
            } else {
                photoList = ['https://placeholder.com'];
            }

            // Build the main photo and thumbnail gallery
            imgContainer.innerHTML = `
                <div class="main-photo-wrapper" style="width:100%; text-align:center; background:#f4f4f4; border-radius:10px; overflow:hidden; margin-bottom:15px;">
                    <img src="${photoList[0]}" id="mainDisplayImg" style="max-width:100%; max-height:500px; object-fit:contain; display:block; margin:auto;">
                </div>
                
                <div class="thumbnail-list" style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">
                    ${photoList.map((imgSrc) => `
                        <img src="${imgSrc}" 
                             onclick="document.getElementById('mainDisplayImg').src='${imgSrc}'"
                             style="width:70px; height:70px; object-fit:cover; cursor:pointer; border-radius:5px; border:2px solid #ddd;"
                             onmouseover="this.style.borderColor='#007bff'"
                             onmouseout="this.style.borderColor='#ddd'">
                    `).join('')}
                </div>
            `;
        }

    } else {
        alert("Ad not found!");
        window.location.href = "index.html";
    }
}; // Closes window.onload

// 2. INTERNAL MESSAGING SYSTEM
function sendMessage() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    
    if (!currentUser) {
        alert("Please login to contact the seller.");
        window.location.href = "login.html";
        return;
    }

    const messageInput = document.getElementById("messageText");
    const messageText = messageInput ? messageInput.value.trim() : "";
    
    if (!messageText) {
        alert("Please enter a message.");
        return;
    }

    const newMessage = {
        id: Date.now(),
        adId: ad.id,
        adTitle: ad.title,
        senderEmail: currentUser.email,
        receiverEmail: ad.userEmail, 
        text: messageText,
        date: new Date().toLocaleString()
    };

    const allMessages = JSON.parse(localStorage.getItem("messages") || "[]");
    allMessages.push(newMessage);
    localStorage.setItem("messages", JSON.stringify(allMessages));

    alert("Message sent!");
    if(messageInput) messageInput.value = "";
} // Closes sendMessage

function submitReport() {
    const reason = document.getElementById('reportReason').value;
    const adId = getAdIdFromURL(); // Your existing logic to find which ad is open
    
    const reportData = {
        adId: adId,
        reason: reason,
        timestamp: new Date().toISOString()
    };

    // Save to your storage system
    saveReportToStorage(reportData); 
    alert("Thank you. Our moderators will review this post.");
    document.getElementById('reportModal').style.display = 'none';
}
function saveReportToStorage(reportData) {
    // 1. Get existing reports or start with an empty list
    let allReports = JSON.parse(localStorage.getItem('flaggedAds')) || [];

    // 2. Add the new report
    allReports.push(reportData);

    // 3. Save it back to localStorage
    localStorage.setItem('flaggedAds', JSON.stringify(allReports));
    
    console.log("Report stored successfully.");
}
// 1. Show the modal when the button is clicked
function showReportModal() {
    document.getElementById('reportModal').style.display = 'block';
}

// 2. Hide the modal if they cancel
function closeModal() {
    document.getElementById('reportModal').style.display = 'none';
}

// 3. Update your submit function to close the modal after finishing
function submitReport() {
    const reason = document.getElementById('reportReason').value;
    const adId = getAdIdFromURL(); 
    
    const reportData = {
        adId: adId,
        reason: reason,
        timestamp: new Date().toISOString()
    };

    saveReportToStorage(reportData); 
    
    alert("Report submitted for Ad ID: " + adId);
    
    closeModal(); // This hides the box after you click submit
}
