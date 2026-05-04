let currentLanguage = localStorage.getItem("language") || "en";

// MAIN FUNCTION (this is what your buttons call)
function setLanguage(lang) {
    loadLanguage(lang);
}

// Load JSON file
function loadLanguage(language) {
    fetch(`${language}.json`)
        .then(res => res.json())
        .then(translations => {
            localStorage.setItem("language", language);
            applyTranslations(translations, language);
        })
        .catch(err => {
            console.error("Language load error:", err);
        });
}

// Apply translations
function applyTranslations(translations, language) {

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[key]) {
            el.innerText = translations[key];
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (translations[key]) {
            el.placeholder = translations[key];
        }
    });

    const isArabic = language === "ar";

    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";

    document.body.style.textAlign = isArabic ? "right" : "left";
}

// auto load on page start
document.addEventListener("DOMContentLoaded", () => {
    loadLanguage(currentLanguage);
});
