let currentLanguage = localStorage.getItem("language") || "en";

function loadLanguage(language) {
    fetch(`${language}.json`)
        .then(response => response.json())
        .then(translations => {
            localStorage.setItem("language", language);
            updateText(translations, language); // Pass 'language' to help with RTL
        })
        .catch(error => console.error('Error loading language file:', error));
}
function updateText(translations, language) {
    for (const [key, value] of Object.entries(translations)) {
        const element = document.getElementById(key);
        if (element) {
            // FIX: Check if it's an input field to update the placeholder
            if (element.tagName === 'INPUT') {
                element.placeholder = value;
            } else {
                element.innerText = value;

            }
        }
    }
 

    // FIX: Use the language code (ar) for RTL instead of checking specific text
    if (language === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.lang = 'ar';
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.lang = language;
    }
}

// Setup listeners (added checks so it doesn't error if a button is missing)
document.addEventListener('DOMContentLoaded', () => {
    const buttons = {
        'lang-en': 'en',
        'lang-es': 'es',
        'lang-fr': 'fr',
        'lang-ar': 'ar'
    };

    for (const [id, lang] of Object.entries(buttons)) {
        const btn = document.getElementById(id);
        if (btn) btn.onclick = () => loadLanguage(lang);
    }

    // Handle dropdown if it exists on the page
    const switcher = document.getElementById('languageSwitcher');
    if (switcher) {
        switcher.value = currentLanguage;
        switcher.onchange = (e) => loadLanguage(e.target.value);
    }

    loadLanguage(currentLanguage);
});

