// Import Firebase and other utilities
import { auth, db, rtdb } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://gstatic.com";
import { doc, getDoc } from "https://gstatic.com";

// Initialize variables
let currentUserEmail = "Guest";
let ad;
const adId = new URLSearchParams(window.location.search).get("id");

// Check auth state
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserEmail = user.email;
    }
});

// Initialize the details page
async function initDetailsPage() {
    if (!adId) {
        window.location.href = "index.html";
        return;
    }

    try {
        const adRef = doc(db, "marketplace_ads", adId);
        const snapshot = await getDoc(adRef);

        if (!snapshot.exists()) {
            alert("Ad not found!");
            window.location.href = "index.html";
            return;
        }

        ad = snapshot.data();
        renderAdDetails();
    } catch (error) {
        console.error("Error loading ad:", error);
        alert("Failed to load ad details.");
    }
}

// Render the ad details
function renderAdDetails() {
    setText("adTitle", ad.title);
    setText("adPrice", `$${ad.price}`);
    setText("adCategory", ad.category);
    setText("adLocation", ad.location || "Local");
    setText("adDesc", ad.description || getText("no_description"));
    renderImages();
}

// Render images
function renderImages() {
    const imgContainer = document.getElementById("adImageContainer");
    if (!imgContainer) return;

    let photoList = Array.isArray(ad.image) ? ad.image : (ad.image ? [ad.image] : ["https://via.placeholder.com/300"]);

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
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    const messageInput = document.getElementById("messageText");
    const text = messageInput?.value.trim();

    if (!text) return;

    const newMessage = {
        adTitle: ad.title,
        senderEmail: currentUserEmail,
        receiverEmail: ad.userEmail,
        text: text,
        date: new Date().toLocaleString()
    };

    const messagesRef = ref(rtdb, "marketplace_messages");
    push(messagesRef, newMessage)
        .then(() => {
            alert("Message sent!");
            if (messageInput) messageInput.value = "";
        })
        .catch(err => alert("Error: " + err.message));
}

// Report an ad
window.submitReport = function() {
    const reason = document.getElementById("reportReason")?.value;
    if (!reason) return alert("Please select a reason.");

    const reportRef = ref(rtdb, "flaggedAds");
    push(reportRef, { adId, reason, timestamp: new Date().toISOString() })
        .then(() => {
            alert("Report submitted.");
            closeModal();
        });
}

// Helper functions
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

function getText(key) {
    return (window.translations && window.translations[key]) ? window.translations[key] : key;
}

initDetailsPage();

