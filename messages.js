import { auth } from "./firebase-config.js"; // Firebase Authentication
import { db, doc, getDoc } from "./firebase-config.js"; // Firestore functions
import { rtdb, ref, onValue } from "./firebase-config.js"; // Realtime Database functions

const params = new URLSearchParams(window.location.search);
const adId = params.get("id");

let currentLanguage = localStorage.getItem("language") || "en";
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
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
        console.error(err);
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

    const msgRef = ref(db, "marketplace_messages");

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
                    style="background:#ff4d4d; color:white; border:none; padding:5px 8px; cursor:pointer;">
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
                <textarea id="reply-text-${id}" style="width:100%; height:60px; padding:8px;"></textarea>
                <button onclick="sendReply('${id}')"
                    style="margin-top:5px; background:#28a745; color:white; border:none; padding:6px 10px; cursor:pointer;">
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
    const text = document.getElementById(`reply-text-${id}`).value;

    if (!text.trim()) {
        alert("Reply cannot be empty");
        return;
    }

    const original = globalMessages.find(m => m.firebaseId === id);

    const msgRef = ref(db, "marketplace_messages");

    push(msgRef, {
        text,
        senderEmail: currentUser.email,
        receiverEmail: original?.senderEmail,
        adId,
        date: new Date().toLocaleString()
    });

    alert("Reply sent!");
}

/* --- DELETE --- */
window.deleteMsg = function(id) {
    if (!confirm("Delete this message?")) return;

    const msgRef = ref(db, `marketplace_messages/${id}`);
    remove(msgRef);
}

/* --- START --- */
document.addEventListener('DOMContentLoaded', () => {
    loadLanguage(currentLanguage);
});


