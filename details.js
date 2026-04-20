// details.js (FIXED VERSION)

// details.js (FIXED VERSION)

const params = new URLSearchParams(window.location.search);
// Fix: Use String() for IDs to ensure they match exactly what is in storage
const adId = params.get("id"); 

let ad;

function initDetailsPage() {
    if (!adId) {
        window.location.href = "index.html";
        return;
    }

    // FIX: Change "ads" to "marketplace_ads"
    const ads = JSON.parse(localStorage.getItem("marketplace_ads") || "[]");
    
    // FIX: Compare as Strings to avoid type errors
    ad = ads.find(item => String(item.id) === String(adId));

    if (!ad) {
        alert(getText("ad_not_found") || "Ad not found!");
        window.location.href = "index.html";
        return;
    }

    renderAdDetails();
}

// Keep your existing listeners below this...



// =======================
// RENDER AD
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
// IMAGE RENDER (FIXED)
// =======================
function renderImages() {
    const imgContainer = document.getElementById("adImageContainer");
    if (!imgContainer) return;

    let photoList = [];

    // 1. Force the image data into a clean array
    if (ad.image) {
        if (Array.isArray(ad.image)) {
            // Filter out any null or empty strings
            photoList = ad.image.filter(img => img && img !== "");
        } else if (typeof ad.image === 'string') {
            photoList = [ad.image];
        }
    }

    // 2. If absolutely no photo, use a better placeholder
    if (photoList.length === 0) {
        photoList = ["https://placeholder.com"];
    }

    // 3. Update the HTML
    imgContainer.innerHTML = `
        <div style="width:100%; text-align:center; background:#f4f4f4; border-radius:10px; overflow:hidden; margin-bottom:15px;">
            <img id="mainDisplayImg" src="${photoList[0]}" 
                 style="max-width:100%; max-height:500px; object-fit:contain; display: block; margin: 0 auto;">
        </div>

        <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-top:10px;">
            ${photoList.length > 1 ? photoList.map(img => `
                <img src="${img}"
                     onclick="document.getElementById('mainDisplayImg').src='${this.src}'"
                     style="width:70px; height:70px; object-fit:cover; cursor:pointer; border-radius:5px; border:1px solid #ddd;">
            `).join('') : ""}
        </div>
    `;
}


// =======================
// MESSAGING (TRANSLATED)
// =======================
function sendMessage() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        alert(getText("login_required") || "Please login first.");
        window.location.href = "login.html";
        return;
    }

    const messageInput = document.getElementById("messageText");
    const messageText = messageInput?.value.trim();

    if (!messageText) {
        alert(getText("enter_message") || "Please enter a message.");
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

    const messages = JSON.parse(localStorage.getItem("messages") || "[]");
    messages.push(newMessage);
    localStorage.setItem("messages", JSON.stringify(messages));

    alert(getText("message_sent") || "Message sent!");

    messageInput.value = "";
}

// =======================
// REPORT SYSTEM (FIXED DUPLICATE REMOVED)
// =======================
function showReportModal() {
    document.getElementById("reportModal").style.display = "block";
}

function closeModal() {
    document.getElementById("reportModal").style.display = "none";
}

function submitReport() {
    const reason = document.getElementById("reportReason").value;

    const reportData = {
        adId,
        reason,
        timestamp: new Date().toISOString()
    };

    let reports = JSON.parse(localStorage.getItem("flaggedAds") || "[]");
    reports.push(reportData);
    localStorage.setItem("flaggedAds", JSON.stringify(reports));

    alert(getText("report_sent") || "Report submitted.");
    closeModal();
}

// =======================
// HELPERS (LANGUAGE SAFE)
// =======================
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

function getText(key) {
    return window.translations?.[key];
}
