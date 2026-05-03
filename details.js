let currentUserEmail = "Guest"; 
let ad;
const adId = new URLSearchParams(window.location.search).get("id");
console.log("Ad ID from URL:", adId);

// Check auth state
document.addEventListener("DOMContentLoaded", () => {
    currentUserEmail = localStorage.getItem("currentUserEmail") || "Guest"; // Assuming the user's email is stored in localStorage
    initDetailsPage();
});

// Initialize the details page
async function initDetailsPage() {
    if (!adId) {
        window.location.href = "index.html";  // Redirect if no ad ID in URL
        return;
    }

    // Fetch ad details from localStorage
    const ads = JSON.parse(localStorage.getItem("marketplace_ads")) || [];
    ad = ads.find(ad => ad.id === adId);

    if (!ad) {
        alert("Ad not found");
        console.log("Ad not found in localStorage:", adId);
        window.location.href = "index.html";  // Redirect to homepage if ad not found
        return;
    }

    renderAdDetails();
}

// Render the ad details
function renderAdDetails() {
    setText("adTitle", ad.title);
    setText("adPrice", `$${ad.price}`);
    setText("adCategory", ad.category);
    setText("adLocation", ad.location || "Unknown Location");
    setText("adDesc", ad.description || "No Description");

    renderImages();
}

// Render images
function renderImages() {
    const imgContainer = document.getElementById("adImageContainer");
    if (!imgContainer) return;

    let photoList = Array.isArray(ad.images) && ad.images.length > 0 ? ad.images : [ad.images || "https://via.placeholder.com/300"];

    imgContainer.innerHTML = `
        <div style="width:100%; text-align:center; background:#f4f4f4; border-radius:10px; overflow:hidden; margin-bottom:15px; border:1px solid #ddd;">
            <img id="mainDisplayImg" src="${photoList[0]}" style="max-width:100%; max-height:500px; object-fit:contain; display: block; margin: 0 auto;">
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-top:10px;">
            ${photoList.length > 1 ? photoList.map(img => `
                <img src="${img}" onclick="document.getElementById('mainDisplayImg').src='${img}'"
                     style="width:70px; height:70px; object-fit:cover; cursor:pointer; border-radius:5px; border:1px solid #ccc;">
            `).join('') : ""}
        </div>
    `;
}

// Send a message to the seller
window.sendMessage = function() {
    if (currentUserEmail === "Guest") {
        alert("Please log in first!");
        window.location.href = "login.html";  // Redirect to login page
        return;
    }

    const messageInput = document.getElementById("messageText");
    const text = messageInput?.value.trim();

    if (!text) return;

    const newMessage = {
        adTitle: ad.title,
        senderEmail: currentUserEmail,
        receiverEmail: ad.userEmail, // Make sure ad.userEmail is correctly set in localStorage
        text: text,
        date: new Date().toLocaleString()
    };

    // Store the message in localStorage
    const messages = JSON.parse(localStorage.getItem("marketplace_messages")) || [];
    messages.push(newMessage);
    localStorage.setItem("marketplace_messages", JSON.stringify(messages));

    alert("Message sent successfully!");
    if (messageInput) messageInput.value = "";
}

// Report an ad
window.submitReport = function() {
    const reason = document.getElementById("reportReason")?.value;
    if (!reason) return alert("Please select a reason for reporting.");

    // Store the report in localStorage
    const reports = JSON.parse(localStorage.getItem("flaggedAds")) || [];
    reports.push({ adId, reason, timestamp: new Date().toISOString() });
    localStorage.setItem("flaggedAds", JSON.stringify(reports));

    alert("Report submitted successfully.");
    closeModal();
}

// Open the report modal
function showReportModal() {
    document.getElementById("reportModal").style.display = "block";
}

// Close the report modal
function closeModal() {
    document.getElementById("reportModal").style.display = "none";
}

// Helper functions
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}
