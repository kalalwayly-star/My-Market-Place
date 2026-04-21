// details.js (STABILIZED VERSION)

const params = new URLSearchParams(window.location.search);
const adId = params.get("id"); 

let ad;

// Handle initialization
function initDetailsPage() {
    if (!adId) {
        window.location.href = "index.html";
        return;
    }

    // Connect to the master storage key
    const ads = JSON.parse(localStorage.getItem("marketplace_ads") || "[]");
    
    // Find the ad using string comparison for safety
    ad = ads.find(item => String(item.id) === String(adId));

    if (!ad) {
        alert(getText("ad_not_found") || "Ad not found!");
        window.location.href = "index.html";
        return;
    }

    renderAdDetails();
}

// Ensure init runs
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDetailsPage);
} else {
    initDetailsPage();
}

// =======================
// RENDER AD DATA
// =======================
function renderAdDetails() {
    setText("adTitle", ad.title);
    setText("adPrice", `$${ad.price}`);
    setText("adCategory", ad.category);
    setText("adLocation", ad.location || "Local");
    setText("adDesc", ad.description || getText("no_description"));

    renderImages();
}

// =======================
// IMAGE RENDER (FIXED LOGIC)
// =======================
function renderImages() {
    const imgContainer = document.getElementById("adImageContainer");
    if (!imgContainer) return;

    let photoList = [];

    // Handle array or string data
    if (ad.image) {
        if (Array.isArray(ad.image)) {
            photoList = ad.image.filter(img => img && img !== "");
        } else if (typeof ad.image === 'string') {
            photoList = [ad.image];
        }
    }

    // Placeholder fallback
    if (photoList.length === 0) {
        photoList = ["https://placeholder.com"];
    }

    // Render with corrected thumbnail click logic
    imgContainer.innerHTML = `
        <div style="width:100%; text-align:center; background:#f4f4f4; border-radius:10px; overflow:hidden; margin-bottom:15px; border:1px solid #ddd;">
            <img id="mainDisplayImg" src="${photoList[0]}" 
                 style="max-width:100%; max-height:500px; object-fit:contain; display: block; margin: 0 auto;">
        </div>

        <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-top:10px;">
            ${photoList.length > 1 ? photoList.map(img => `
                <img src="${img}"
                     onclick="document.getElementById('mainDisplayImg').src='${img}'"
                     style="width:70px; height:70px; object-fit:cover; cursor:pointer; border-radius:5px; border:1px solid #ccc; transition: 0.2s;"
                     onmouseover="this.style.borderColor='#007bff'"
                     onmouseout="this.style.borderColor='#ccc'">
            `).join('') : ""}
        </div>
    `;
}

// =======================
// MESSAGING SYSTEM
// =======================
function sendMessage() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    // 1. Check Login
    if (!currentUser || currentUser.email === "Guest") {
        alert(getText("login_required") || "Please login first.");
        window.location.href = "login.html";
        return;
    }

    const messageInput = document.getElementById("messageText");
    const messageText = messageInput?.value.trim();

    // 2. Check Empty Message
    if (!messageText) {
        alert(getText("enter_message") || "Please enter a message.");
        return;
    }

    // 3. Create Message Object
    const newMessage = {
    id: Date.now(),
    adTitle: ad.title,
    senderEmail: currentUser.email,
    receiverEmail: ad.userEmail,
    text: messageText,
    date: new Date().toLocaleString(),
    deletedBySender: false,   // New marker
    deletedByReceiver: false  // New marker
};


    // 4. Save to localStorage
    try {
        const STORAGE_KEY_MSG = "marketplace_messages";
        const allMessages = JSON.parse(localStorage.getItem(STORAGE_KEY_MSG) || "[]");
        
        allMessages.push(newMessage);
        localStorage.setItem(STORAGE_KEY_MSG, JSON.stringify(allMessages));

        // 5. Success UI feedback
        alert(getText("message_sent") || "Message sent successfully!");
        
        if (messageInput) messageInput.value = ""; // Clear the text box
        
        // If you have a modal, close it here (example: closeMessageModal())
        if (typeof closeMessageModal === "function") {
            closeMessageModal();
        }

    } catch (e) {
        console.error("Error sending message:", e);
        alert("Error sending message. Please try again.");
    }
}


// =======================
// REPORT MODAL
// =======================
function showReportModal() {
    const modal = document.getElementById("reportModal");
    if (modal) modal.style.display = "block";
}

function closeModal() {
    const modal = document.getElementById("reportModal");
    if (modal) modal.style.display = "none";
}

function submitReport() {
    const reason = document.getElementById("reportReason")?.value;
    const reportData = { adId: ad.id, reason, timestamp: new Date().toISOString() };

    let reports = JSON.parse(localStorage.getItem("flaggedAds") || "[]");
    reports.push(reportData);
    localStorage.setItem("flaggedAds", JSON.stringify(reports));

    alert(getText("report_sent") || "Report submitted.");
    closeModal();
}

// =======================
// HELPERS
// =======================
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

function getText(key) {
    // Falls back to the key name if translation is missing
    return (window.translations && window.translations[key]) ? window.translations[key] : key;
}

