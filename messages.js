import { db, ref, onValue, push } from "./firebase-config.js";

const params = new URLSearchParams(window.location.search);
const adId = params.get("id"); // This is now the Firebase unique key
/* --- 1. CONFIGURATION & TRANSLATIONS --- */
let currentLanguage = localStorage.getItem("language") || "en";
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
let currentTab = 'received';
let globalMessages = []; // Stores cloud data

async function loadLanguage(lang) {
    try {
        const response = await fetch(`languages/${lang}.json`);
        if (!response.ok) throw new Error("Could not load language file");
        const translations = await response.json();
        localStorage.setItem("language", lang);
        updatePageContent(translations, lang);
        window.translations = translations;
        initMessages(); 
    } catch (error) {
        console.error('Error loading language:', error);
        initMessages(); 
    }
}

function updatePageContent(translations, lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) el.innerText = translations[key];
    });
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
}

/* --- 2. MESSAGING LOGIC --- */
window.changeTab = function(tab) {
    currentTab = tab;
    document.getElementById('btnReceived')?.classList.toggle('active', tab === 'received');
    document.getElementById('btnSent')?.classList.toggle('active', tab === 'sent');
    renderTab();
}

function initMessages() {
    const container = document.getElementById('messageList'); // Ensure this ID matches your HTML
    if (!currentUser || currentUser.email === "Guest") {
        if (container) container.innerHTML = "<p style='text-align:center; padding:20px;'>Please login to see messages.</p>";
        return;
    }

    // LISTEN TO CLOUD
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

window.renderTab = function() {
    const container = document.getElementById('messageList');
    if (!container) return;

    const filtered = globalMessages.filter(m => {
        if (currentTab === 'received') {
            return m.receiverEmail === currentUser.email && m.deletedByReceiver !== true;
        } else {
            return m.senderEmail === currentUser.email && m.deletedBySender !== true;
        }
    });

    if (filtered.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:20px;">No messages found.</p>`;
        return;
    }

    container.innerHTML = filtered.map(m => {
        const person = (currentTab === 'received' ? m.senderEmail : m.receiverEmail) || "User";
        const uniqueId = m.firebaseId;

        return `
            <div class="message-card" style="border:1px solid #ddd; padding:15px; margin-bottom:12px; border-radius:8px; position:relative; background:white;">
                <p style="font-size:0.85rem; color:#007bff; font-weight:bold; margin:0 0 5px 0;">
                    ${currentTab === 'received' ? 'From: ' : 'To: '} ${person}
                </p>
                <p style="margin:5px 0; color:#333;">${m.text}</p>
                <p style="font-size:0.7rem; color:#999; margin:5px 0 0 0;">${m.date || ""}</p>

                <div style="margin-top:10px; display:flex; gap:10px;">
                    <button onclick="deleteMsg('${uniqueId}')" 
                            style="background:#ff4d4d; color:white; border:none; border-radius:4px; padding:4px 8px; cursor:pointer; font-size:0.7rem; font-weight:bold;">
                        DELETE
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

window.deleteMsg = function(firebaseId) {
    if (!confirm("Delete this message?")) return;
    
    // SMART DELETE: Hide for current user, only remove from cloud if both delete
    const msgRef = ref(db, `marketplace_messages/${firebaseId}`);
    const msgData = globalMessages.find(m => m.firebaseId === firebaseId);

    if (currentTab === 'received') {
        msgData.deletedByReceiver = true;
    } else {
        msgData.deletedBySender = true;
    }

    if (msgData.deletedBySender && msgData.deletedByReceiver) {
        remove(msgRef); // Remove from Cloud completely
    } else {
        set(msgRef, msgData); // Update Cloud to hide for this user
    }
}

/* --- 3. INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', () => {
    const switcher = document.getElementById('languageSwitcher');
    if (switcher) {
        switcher.value = currentLanguage;
        switcher.addEventListener('change', (e) => loadLanguage(e.target.value));
    }
    loadLanguage(currentLanguage);
});


