import { db, doc, getDoc } from "./firebase-config.js"; // Firestore functions
import { auth, db, rtdb } from "./firebase-config.js"; 
import { ref, onValue, get, push, child } from "https://gstatic.com";


let ad;
const currentUser = JSON.parse(localStorage.getItem("currentUser")) || { email: "Guest" };


async function initDetailsPage() {
    const params = new URLSearchParams(window.location.search);
    const adId = params.get("id"); // Make sure you are getting the ID from the URL

    if (!adId) {
        window.location.href = "index.html";
        return;
    }

    try {
        // Use Firestore 'doc' and 'getDoc' instead of rtdb 'ref' and 'get'
        const adRef = doc(db, "marketplace_ads", adId);
        const snapshot = await getDoc(adRef);

        if (!snapshot.exists()) {
            alert("Ad not found!");
            window.location.href = "index.html";
            return;
        }

        ad = snapshot.data(); // Firestore uses .data() instead of .val()
        renderAdDetails(); 

    } catch (error) {
        console.error("Error loading ad:", error);
    }
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

// 3. MESSAGING SYSTEM (Realtime Database Version)
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

    // SAVE TO FIREBASE MESSAGES (Realtime Database)
    const messagesRef = ref(db, "marketplace_messages");
    push(messagesRef, newMessage)
        .then(() => {
            alert(getText("message_sent") || "Message sent to the cloud!");
            if (messageInput) messageInput.value = "";
            if (typeof closeMessageModal === "function") closeMessageModal();
        })
        .catch(err => alert("Error: " + err.message));
}

// 4. REPORT SYSTEM (Realtime Database Version)
window.showReportModal = function() {
    const modal = document.getElementById("reportModal");
    if (modal) modal.style.display = "block";  // Show the report modal
}

window.closeModal = function() {
    const modal = document.getElementById("reportModal");
    if (modal) modal.style.display = "none";  // Close the report modal
}

window.submitReport = function() {
    const reason = document.getElementById("reportReason")?.value;  // Get the selected reason
    if (!reason) {
        alert("Please select a reason for reporting.");
        return;
    }

    const reportData = { 
        adId: adId, 
        reason, 
        timestamp: new Date().toISOString()  // Record the time the report was made
    };

    const reportRef = ref(db, "flaggedAds");  // Reference to the flaggedAds in Realtime Database
    push(reportRef, reportData)  // Push the report to the database
        .then(() => {
            alert(getText("report_sent") || "Report submitted to cloud.");  // Show success message
            closeModal();  // Close the modal after submission
        })
        .catch(err => {
            console.error("Error submitting report:", err);
            alert("There was an error submitting your report. Please try again.");
        });
}

// 5. HELPERS
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;  // Set text content for the element
}

function getText(key) {
    return (window.translations && window.translations[key]) ? window.translations[key] : key;  // Get translated text
}

// Run init
initDetailsPage();  // Initialize the page and load ad details
