// Set the default language to English or the language from localStorage
let currentLanguage = localStorage.getItem("language") || "en";

// Load the selected language and update the page content
function loadLanguage(language) {
    // FIXED: Added backticks for template literal
    fetch(`${language}.json`)
        .then(response => {
            if (!response.ok) throw new Error("File not found");
            return response.json();
        })
        .then(translations => {
            localStorage.setItem("language", language);
            updateText(translations, language);
        })
        .catch(error => {
            console.error("Error loading language file:", error);
            // Fallback to English only if current attempt isn't already English
            if (language !== "en") {
                loadLanguage("en");
            }
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
            // FIXED: Added backticks and quotes
            console.warn(`Missing translation key: ${key}`);
        }
    });

    // 2. PLACEHOLDERS (using data-i18n-placeholder attributes)
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (translations[key]) {
            el.placeholder = translations[key];
        }
    });

    // 3. Direction and Lang support
    const isRTL = (language === "ar");
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
    document.documentElement.lang = language;
}

// Set up language buttons and switcher
document.addEventListener("DOMContentLoaded", () => {
    // 1. Handle Button Clicks
    const langButtons = {
        "lang-en": "en",
        "lang-es": "es",
        "lang-fr": "fr",
        "lang-ar": "ar"
    };

    Object.entries(langButtons).forEach(([id, lang]) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                loadLanguage(lang);
            });
        }
    });

    // 2. Handle Dropdown Switcher
    const switcher = document.getElementById("languageSwitcher");
    if (switcher) {
        switcher.value = currentLanguage;
        switcher.onchange = (e) => loadLanguage(e.target.value);
    }

    // 3. Initial Load
    loadLanguage(currentLanguage);
});
