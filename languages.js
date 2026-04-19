let currentLanguage = localStorage.getItem("language") || "en";

function loadLanguage(language) {
    fetch(`${language}.json`)
        .then(response => response.json())
        .then(translations => {
            localStorage.setItem("language", language);
            updateText(translations, language);
        })
        .catch(error => console.error("Error loading language file:", error));
}

function updateText(translations, language) {

    // ✅ 1. TEXT CONTENT (data-i18n)
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[key]) {
            el.innerText = translations[key];
        } else {
            console.warn("Missing key:", key);
        }
    });

    // ✅ 2. PLACEHOLDERS (data-i18n-placeholder)
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (translations[key]) {
            el.placeholder = translations[key];
        }
    });

    // ❌ OPTIONAL backward support (old IDs - remove later)
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

    // 🌍 RTL SUPPORT
    if (language === "ar") {
        document.documentElement.setAttribute("dir", "rtl");
        document.documentElement.lang = "ar";
    } else {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.lang = language;
    }
}

// 🔘 LANGUAGE BUTTONS
document.addEventListener("DOMContentLoaded", () => {
    const buttons = {
        "lang-en": "en",
        "lang-es": "es",
        "lang-fr": "fr",
        "lang-ar": "ar"
    };

    Object.entries(buttons).forEach(([id, lang]) => {
        const btn = document.getElementById(id);
        if (btn) btn.onclick = () => loadLanguage(lang);
    });

    const switcher = document.getElementById("languageSwitcher");
    if (switcher) {
        switcher.value = currentLanguage;
        switcher.onchange = (e) => loadLanguage(e.target.value);
    }

    loadLanguage(currentLanguage);
});

