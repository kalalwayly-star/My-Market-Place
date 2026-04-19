// Set the default language to English or the language from localStorage
let currentLanguage = localStorage.getItem("language") || "en";

// Load the selected language and update the page content
function loadLanguage(language) {
    fetch(${language}.json)
        .then(response => response.json())
        .then(translations => {
            localStorage.setItem("language", language);
            updateText(translations, language);
        })
        .catch(error => {
            console.error("Error loading language file:", error);
            // Optionally, fall back to English if there's an error
            loadLanguage("en");
        });
}

// Update text and placeholders in the DOM based on translations
function updateText(translations, language) {
    // 1. TEXT CONTENT (using data-i18n attributes)
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[key]) {
            el.innerText = translations[key];
        } else {
console.warn(Missing translation key: ${key} (add it to JSON files));        }
    });

    // 2. PLACEHOLDERS (using data-i18n-placeholder attributes)
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (translations[key]) {
            el.placeholder = translations[key];
        }
    });

    // 3. Backward support for old IDs (should remove later if no longer needed)
    document.querySelectorAll("[id]").forEach(el => {
        const key = el.id;
        if (translations[key] && !el.hasAttribute("data-i18n")) {
            if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                el.placeholder = translations[key];
            } else {
                el.innerText = translations[key];
            }
        }
    });

    // 4. RTL support for Arabic language
    if (language === "ar") {
        document.documentElement.setAttribute("dir", "rtl");
        document.documentElement.lang = "ar";
    } else {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.lang = language;
    }
}

// Set up language buttons and switcher
document.addEventListener("DOMContentLoaded", () => {
    // Language switcher buttons
    const buttons = {
        "lang-en": "en",
        "lang-es": "es",
        "lang-fr": "fr",
        "lang-ar": "ar"
    };

    // Add click event listeners to each button for language change
    Object.entries(buttons).forEach(([id, lang]) => {
        const btn = document.getElementById(id);
        if (btn) btn.onclick = () => loadLanguage(lang);
    });

    // Handle the dropdown switcher for language selection
    const switcher = document.getElementById("languageSwitcher");
    if (switcher) {
        switcher.value = currentLanguage;
        switcher.onchange = (e) => loadLanguage(e.target.value);
    }

    // Load the initial language based on the saved setting or default to 'en'
    loadLanguage(currentLanguage);
});
