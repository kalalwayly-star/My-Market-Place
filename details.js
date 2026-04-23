import { db } from "./firebase-config.js";

import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
const params = new URLSearchParams(window.location.search);
const adId = params.get("id"); // This is now the Firebase unique key

let ad;
const currentUser = JSON.parse(localStorage.getItem("currentUser")) || { email: "Guest" };

// 1. INITIALIZATION (Load from Cloud)
function initDetailsPage() {
    if (!adId) {
        window.location.href = "index.html";
        return;
    }

    const adRef = ref(db, `marketplace_ads/${adId}`);
    
    onValue(adRef, (snapshot) => {
        ad = snapshot.val();

        if (!ad) {
            alert("Ad not found in the cloud!");
            window.location.href = "index.html";
            return;
        }

        renderAdDetails();
    });
}

// 2. RENDER AD DATA
function renderAdDetails() {
    setText("adTitle", ad.title);
    setText("adPrice", `$${ad.price}`);
    setText("adCategory", ad.category);
    setText("adLocation", ad.location || "Local");
    setText("adDesc", ad.description || getText("no_description"));

    renderImages();
}

function renderImages() {
    const imgContainer = document.getElementById("adImageContainer");
    if (!imgContainer) return;

    let photoList = [];
    if (ad.image) {
        photoList = Array.isArray(ad.image) ? ad.image : [ad.image];
    }
    if (photoList.length === 0) photoList = ["https://placeholder.com"];

    imgContainer.innerHTML = `
        <div style="width:100%; text-align:center; background:#f4f4f4; border-radius:10px; overflow:hidden; margin-bottom:15px; border:1px solid #ddd;">
            <img id="mainDisplayImg" src="${photoList[0]}" 
                 style="max-width:100%; max-height:500px; object-fit:contain; display: block; margin: 0 auto;">
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-top:10px;">
            ${photoList.length > 1 ? photoList.map(img => `
                <img src="${img}"
                     onclick="document.getElementById('mainDisplayImg').src='${img}'"
                     style="width:70px; height:70px; object-fit:cover; cursor:pointer; border-radius:5px; border:1px solid #ccc;">
            `).join('') : ""}
        </div>
    `;
}

// 3. MESSAGING SYSTEM (Cloud Version)
window.sendMessage = function() {
    if (!currentUser || currentUser.email === "Guest") {
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
        adTitle: ad.title,
        senderEmail: currentUser.email,
        receiverEmail: ad.userEmail,
        text: messageText,
        date: new Date().toLocaleString(),
        deletedBySender: false,
        deletedByReceiver: false
    };

    // SAVE TO FIREBASE MESSAGES
    const msgRef = ref(db, "marketplace_messages");
    push(msgRef, newMessage)
        .then(() => {
            alert(getText("message_sent") || "Message sent to the cloud!");
            if (messageInput) messageInput.value = "";
            if (typeof closeMessageModal === "function") closeMessageModal();
        })
        .catch(err => alert("Error: " + err.message));
}

// 4. REPORT SYSTEM (Cloud Version)
window.showReportModal = function() {
    const modal = document.getElementById("reportModal");
    if (modal) modal.style.display = "block";
}

window.closeModal = function() {
    const modal = document.getElementById("reportModal");
    if (modal) modal.style.display = "none";
}

window.submitReport = function() {
    const reason = document.getElementById("reportReason")?.value;
    const reportData = { adId: adId, reason, timestamp: new Date().toISOString() };

    const reportRef = ref(db, "flaggedAds");
    push(reportRef, reportData)
        .then(() => {
            alert(getText("report_sent") || "Report submitted to cloud.");
            closeModal();
        });
}

// 5. HELPERS
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

function getText(key) {
    return (window.translations && window.translations[key]) ? window.translations[key] : key;
}

// Run init
initDetailsPage();

