let currentUserEmail = "Guest";
let ad = null;
const adId = new URLSearchParams(window.location.search).get("id");

// Page load
window.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");
    currentUserEmail = loggedInUser?.email || "Guest";
    initDetailsPage();
});

// Initialize details page
function initDetailsPage() {
    if (!adId) {
        window.location.href = "index.html";
        return;
    }

    // Use same storage key as main.js
    const ads = JSON.parse(localStorage.getItem("ads") || "[]");
    ad = ads.find(item => item.id === adId);

    if (!ad) {
        alert("Ad not found.");
        window.location.href = "index.html";
        return;
    }

    renderAdDetails();
}

// Render ad details
function renderAdDetails() {
    setText("adTitle", ad.title || "Untitled Ad");
    setText("adPrice", `$${ad.price || 0}`);
    setText("adCategory", ad.category || "Unknown");
    setText("adLocation", ad.location || "Unknown Location");
    setText("adDesc", ad.description || "No Description Available");
    setText("sellerEmail", ad.userEmail || ad.userId || "Unknown Seller");

    renderImages();
}

// Render images gallery
function renderImages() {
    const imgContainer = document.getElementById("adImageContainer");
    if (!imgContainer) return;

    let photoList = [];

    if (Array.isArray(ad.images) && ad.images.length > 0) {
        photoList = ad.images;
    } else if (ad.image) {
        photoList = [ad.image];
    } else {
        photoList = ["https://via.placeholder.com/500x300?text=No+Image"];
    }

    imgContainer.innerHTML = `
        <div style="width:100%; text-align:center; background:#f4f4f4; border-radius:10px; overflow:hidden; margin-bottom:15px; border:1px solid #ddd;">
            <img id="mainDisplayImg" src="${photoList[0]}" style="max-width:100%; max-height:500px; object-fit:contain; display:block; margin:0 auto;">
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-top:10px;">
            ${photoList.map(img => `
                <img src="${img}" 
                     onclick="document.getElementById('mainDisplayImg').src='${img}'"
                     style="width:70px; height:70px; object-fit:cover; cursor:pointer; border-radius:5px; border:1px solid #ccc;">
            `).join('')}
        </div>
    `;
}

// Send message to seller
window.sendMessage = function () {
    if (currentUserEmail === "Guest") {
        alert("Please log in first!");
        window.location.href = "login.html";
        return;
    }

    const messageInput = document.getElementById("messageText");
    const text = messageInput?.value.trim();

    if (!text) {
        alert("Please enter a message.");
        return;
    }

    const newMessage = {
        adId: ad.id,
        adTitle: ad.title,
        senderEmail: currentUserEmail,
        receiverEmail: ad.userEmail || ad.userId,
        text,
        date: new Date().toLocaleString()
    };

    const messages = JSON.parse(localStorage.getItem("marketplace_messages") || "[]");
    messages.push(newMessage);
    localStorage.setItem("marketplace_messages", JSON.stringify(messages));

    alert("Message sent successfully!");
    messageInput.value = "";
};

// Report ad
window.submitReport = function () {
    const reason = document.getElementById("reportReason")?.value;

    if (!reason) {
        alert("Please select a reason.");
        return;
    }

    const reports = JSON.parse(localStorage.getItem("flaggedAds") || "[]");
    reports.push({
        adId: ad.id,
        reason,
        timestamp: new Date().toISOString()
    });

    localStorage.setItem("flaggedAds", JSON.stringify(reports));

    alert("Report submitted successfully.");
    closeModal();
};

// Modal controls
window.showReportModal = function () {
    const modal = document.getElementById("reportModal");
    if (modal) modal.style.display = "block";
};

window.closeModal = function () {
    const modal = document.getElementById("reportModal");
    if (modal) modal.style.display = "none";
};

// Helper
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

