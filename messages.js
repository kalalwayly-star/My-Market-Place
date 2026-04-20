/* --- 1. CONFIGURATION & TRANSLATIONS --- */
let currentLanguage = localStorage.getItem("language") || "en";
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

async function loadLanguage(lang) {
    try {
        const response = await fetch(`languages/${lang}.json`);
        if (!response.ok) throw new Error("Could not load language file");
        const translations = await response.json();
        localStorage.setItem("language", lang);
        updatePageContent(translations, lang);
        window.translations = translations;
        
        // After translating, load the messages
        initMessages(); 
    } catch (error) {
        console.error('Error loading language:', error);
        initMessages(); // Load even if translation fails
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
let currentTab = 'received';

function initMessages() {
    if (!currentUser || currentUser.email === "Guest") {
        const container = document.getElementById('messageContainer');
        if (container) container.innerHTML = "<p style='text-align:center; padding:20px;'>Please login to see messages.</p>";
        return;
    }
    renderTab();
}

function changeTab(tab) {
    currentTab = tab;
    // Update button UI
    document.getElementById('btnReceived')?.classList.toggle('active', tab === 'received');
    document.getElementById('btnSent')?.classList.toggle('active', tab === 'sent');
    renderTab();
}

function renderTab() {
    const container = document.getElementById('messageContainer');
    if (!container) return;

    const allMessages = JSON.parse(localStorage.getItem("marketplace_messages") || "[]");
    
    // Filter based on Sent or Received
    const filtered = allMessages.filter(msg => {
        if (currentTab === 'received') return msg.receiver === currentUser.email;
        return msg.sender === currentUser.email;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:20px; color:#666;">No ${currentTab} messages found.</p>`;
        return;
    }

    container.innerHTML = filtered.map(msg => `
        <div class="message-card" style="border:1px solid #ddd; padding:15px; margin-bottom:12px; border-radius:8px; position:relative; background:white; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <p style="font-size:0.85rem; color:#007bff; margin-bottom:5px; font-weight:bold;">
                ${currentTab === 'received' ? 'From: ' + msg.sender : 'To: ' + msg.receiver}
            </p>
            <p style="margin:0; color:#333; line-height:1.4;">${msg.text}</p>
            <p style="font-size:0.7rem; color:#999; margin-top:8px;">${msg.date || ''}</p>

            <!-- DELETE BUTTON -->
            <button onclick="deleteMsg('${msg.id}')" 
                    style="position:absolute; top:12px; right:12px; background:none; border:none; color:#ff4d4d; cursor:pointer; font-size:1.1rem;">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `).join('');
}

function deleteMsg(id) {
    if (!confirm("Are you sure you want to delete this message?")) return;

    let allMessages = JSON.parse(localStorage.getItem("marketplace_messages") || "[]");
    const updated = allMessages.filter(m => String(m.id) !== String(id));
    localStorage.setItem("marketplace_messages", JSON.stringify(updated));
    
    renderTab(); // Refresh view without reloading page
}

/* --- 3. INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', () => {
    // Language Switcher setup
    const switcher = document.getElementById('languageSwitcher');
    if (switcher) {
        switcher.value = currentLanguage;
        switcher.addEventListener('change', (e) => loadLanguage(e.target.value));
    }

    loadLanguage(currentLanguage);
});


