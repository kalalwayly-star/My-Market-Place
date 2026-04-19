// 1. Get saved language or default to English
let currentLanguage = localStorage.getItem("language") || "en";

// 2. Main function to load and apply translations
async function loadLanguage(lang) {
    try {
        const response = await fetch(`languages/${lang}.json`);
        if (!response.ok) throw new Error("Could not load language file");

        const translations = await response.json();

        // Save choice
        localStorage.setItem("language", lang);

        // Update the HTML content
        updatePageContent(translations, lang);

        // Store globally so JS pages can reuse it
        window.translations = translations;

    } catch (error) {
        console.error('Error loading language:', error);
    }
}

// 3. Helper function to swap text and change direction
function updatePageContent(translations, lang) {
    // Update elements using data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            el.innerText = translations[key];
        }
    });

    // Update elements using data-i18n-placeholder for placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[key]) {
            el.placeholder = translations[key];
        }
    });

    // ID-based fallback (use carefully)
    for (const [key, value] of Object.entries(translations)) {
        const element = document.getElementById(key);
        if (element && !element.hasAttribute("data-i18n")) {
            element.innerText = value;
        }
    }

    // Apply RTL for Arabic, LTR for others
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
}

// 4. Setup Listeners for Dropdown and Buttons
document.addEventListener('DOMContentLoaded', () => {
    // A. Handle the Dropdown Switcher (from your languages.html)
    const switcher = document.getElementById('languageSwitcher');
    if (switcher) {
        switcher.value = currentLanguage; // Sync dropdown with saved language
        switcher.addEventListener('change', (e) => {
            loadLanguage(e.target.value);
        });
    }

    // B. Handle Buttons (if you have them on other pages)
    const buttonMap = {
        'lang-en': 'en',
        'lang-es': 'es',
        'lang-fr': 'fr',
        'lang-ar': 'ar'
    };

    for (const [id, lang] of Object.entries(buttonMap)) {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => loadLanguage(lang));
        }
    }

    // 5. Run initial translation on page load
    loadLanguage(currentLanguage);
});



