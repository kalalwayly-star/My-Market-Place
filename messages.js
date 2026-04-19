// 1. Get saved language or default to English
let currentLanguage = localStorage.getItem("language") || "en";

// 2. Load language file
async function loadLanguage(lang) {
    try {
        const response = await fetch(`languages/${lang}.json`);
        if (!response.ok) throw new Error("Could not load language file");

        const translations = await response.json();

        localStorage.setItem("language", lang);

        updatePageContent(translations, lang);

        // store globally so JS pages can reuse it
        window.translations = translations;

    } catch (error) {
        console.error("Error loading language:", error);
    }
}

// 3. Apply translations
function updatePageContent(translations, lang) {

    // ✅ TEXT ELEMENTS
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[key]) {
            el.innerText = translations[key];
        }
    });

    // ✅ PLACEHOLDERS (IMPORTANT FIX)
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (translations[key]) {
            el.placeholder = translations[key];
        }
    });

    // ⚠️ ID-based fallback (use carefully)
    for (const [key, value] of Object.entries(translations)) {
        const el = document.getElementById(key);
        if (el && !el.hasAttribute("data-i18n")) {
            el.innerText = value;
        }
    }

    // RTL support
    document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";
    document.documentElement.lang = lang;
}

// 4. Setup listeners
document.addEventListener("DOMContentLoaded", () => {

    const switcher = document.getElementById("languageSwitcher");
    if (switcher) {
        switcher.value = currentLanguage;
        switcher.addEventListener("change", (e) => {
            loadLanguage(e.target.value);
        });
    }

    const buttonMap = {
        "lang-en": "en",
        "lang-es": "es",
        "lang-fr": "fr",
        "lang-ar": "ar"
    };

    for (const [id, lang] of Object.entries(buttonMap)) {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener("click", () => loadLanguage(lang));
        }
    }

    loadLanguage(currentLanguage);
});



