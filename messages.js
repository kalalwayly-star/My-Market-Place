// 1. CLEAN IMPORTS from your config
import { auth, rtdb } from "./firebase-config.js"; 

// 2. Full CDN paths for Realtime Database (to see and delete messages)
import { ref, onValue, push, remove } from "https://gstatic.com";

// 3. Full CDN path for Auth State (needed to check if user is logged in)
import { onAuthStateChanged } from "https://gstatic.com";


const params = new URLSearchParams(window.location.search);
const adId = params.get("id");

let currentLanguage = localStorage.getItem("language") || "en";
// Use a fallback for currentUser to prevent crashes
const currentUser = JSON.parse(localStorage.getItem("currentUser")) || { email: "Guest" };
let currentTab = 'received';
let globalMessages = [];

/* --- LANGUAGE --- */
async function loadLanguage(lang) {
    try {
        const response = await fetch(`languages/${lang}.json`);
        const translations = await response.json();

        localStorage.setItem("language", lang);
        window.translations = translations;

        updatePageContent(translations, lang);
        initMessages();
    } catch (err) {
        console.error("Language Load Error:", err);
        initMessages();
    }
}

function updatePageContent(translations, lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) el.innerText = translations[key];
    });

    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
}

/* --- TABS --- */
window.changeTab = function(tab) {
    currentTab = tab;
    document.getElementById('btnReceived')?.classList.toggle('active', tab === 'received');
    document.getElementById('btnSent')?.classList.toggle('active', tab === 'sent');
    renderTab();
}

/* --- INIT --- */
function initMessages() {
    const container = document.getElementById('messageList');

    if (!currentUser || currentUser.email === "Guest") {
        if (container) {
            container.innerHTML = "<p style='text-align:center;'>Please login to see messages.</p>";
        }
        return;
    }

    // FIXED: Using 'rtdb' instead of 'db'
    const msgRef = ref(rtdb, "marketplace_messages");

    onValue(msgRef, (snapshot) => {
        const data = snapshot.val();
        globalMessages = [];

        if (data) {
            for (let id in data) {
                globalMessages.push({ firebaseId: id, ...data[id] });
            }
        }
        renderTab();
    });
}

/* --- RENDER --- */
window.renderTab = function() {
    const container = document.getElementById('messageList');
    if (!container) return;

    const filtered = globalMessages.filter(m => {
        if (currentTab === 'received') {
            return m.receiverEmail === currentUser.email;
        } else {
            return m.senderEmail === currentUser.email;
        }
    });

    if (filtered.length === 0) {
        container.innerHTML = `<p style="text-align:center;">No messages found.</p>`;
        return;
    }

    container.innerHTML = filtered.map(m => {
        const person = (currentTab === 'received' ? m.senderEmail : m.receiverEmail) || "User";
        const id = m.firebaseId;

        return `
        <div class="message-card" style="border:1px solid #ddd; padding:15px; margin-bottom:12px; border-radius:8px; background:white;">
            <p style="font-size:0.85rem; color:#007bff; font-weight:bold;">
                ${currentTab === 'received' ? 'From' : 'To'}: ${person}
            </p>
            <p>${m.text}</p>
            <p style="font-size:0.7rem; color:#999;">${m.date || ""}</p>
            <div style="display:flex; gap:10px; margin-top:10px; align-items:center;">
                <button onclick="deleteMsg('${id}')"
                    style="background:#ff4d4d; color:white; border:none; padding:5px 8px; cursor:pointer; border-radius:4px;">
                    Delete
                </button>
                ${currentTab === 'received' ? `
                <button onclick="toggleReply('${id}')"
                    style="background:none; border:none; color:#007bff; font-weight:bold; cursor:pointer;">
                    Reply
                </button>
                ` : ''}
            </div>
            <div id="reply-box-${id}" style="display:none; margin-top:10px;">
                <textarea id="reply-text-${id}" style="width:100%; height:60px; padding:8px; border:1px solid #ccc; border-radius:4px;"></textarea>
                <button onclick="sendReply('${id}')"
                    style="margin-top:5px; background:#28a745; color:white; border:none; padding:6px 10px; cursor:pointer; border-radius:4px;">
                    Send
                </button>
            </div>
        </div>
        `;
    }).join('');
}

/* --- REPLY FUNCTIONS --- */
window.toggleReply = function(id) {
    const box = document.getElementById(`reply-box-${id}`);
    if (box) {
        box.style.display = box.style.display === "none" ? "block" : "none";
    }
}

window.sendReply = function(id) {
    const textInput = document.getElementById(`reply-text-${id}`);
    const text = textInput.value;

    if (!text.trim()) {
        alert("Reply cannot be empty");
        return;
    }

    const original = globalMessages.find(m => m.firebaseId === id);

    // FIXED: Using 'rtdb'
    const msgRef = ref(rtdb, "marketplace_messages");

    push(msgRef, {
        text: text,
        senderEmail: currentUser.email,
        receiverEmail: original?.senderEmail,
        adId: adId || "General",
        date: new Date().toLocaleString()
    }).then(() => {
        alert("Reply sent!");
        textInput.value = "";
        window.toggleReply(id);
    });
}

/* --- DELETE --- */
window.deleteMsg = function(id) {
    if (!confirm("Delete this message?")) return;
    // FIXED: Using 'rtdb'
    const msgRef = ref(rtdb, `marketplace_messages/${id}`);
    remove(msgRef).then(() => {
        alert("Message deleted.");
    });
}

/* --- START --- */
document.addEventListener('DOMContentLoaded', () => {
    loadLanguage(currentLanguage);
});



