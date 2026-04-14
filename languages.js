let currentLanguage = localStorage.getItem("language") || "en";  // Default to 'en' if no language is set

// Function to load the language file (e.g., en.json)
function loadLanguage(language) {
    fetch(`${language}.json`)  // Ensure the path is correct
        .then(response => response.json())
        .then(translations => {
            localStorage.setItem("language", language);  // Save the selected language in localStorage
            updateText(translations);  // Update the page with translated text
        })
        .catch(error => console.error('Error loading language file:', error));
}

// Function to update text content on the page based on the selected language
function updateText(translations) {
    // Loop through all the keys in the translations object and update the corresponding elements
    for (const [key, value] of Object.entries(translations)) {
        const element = document.getElementById(key);
        if (element) {
            element.innerText = value;  // Update the element with translated text
        }
    }

    // Handle RTL (Right-To-Left) direction for languages like Arabic
    if (translations.greeting === "مرحباً، أهلاً بك في My Marketplace!") {
        document.documentElement.setAttribute('dir', 'rtl');  // Apply RTL for Arabic
    } else {
        document.documentElement.setAttribute('dir', 'ltr');  // Apply LTR for other languages
    }
}

// Set up event listeners for language buttons
document.getElementById('lang-en').addEventListener('click', () => {
    loadLanguage("en");  // Load English language
});

document.getElementById('lang-es').addEventListener('click', () => {
    loadLanguage("es");  // Load Spanish language
});

document.getElementById('lang-fr').addEventListener('click', () => {
    loadLanguage("fr");  // Load French language
});

document.getElementById('lang-ar').addEventListener('click', () => {
    loadLanguage("ar");  // Load Arabic language
});

// Load the default language or previously selected language on page load
window.onload = () => {
    loadLanguage(currentLanguage);  // Load the language stored in localStorage or default to English
};
