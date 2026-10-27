// Initialises variables for sfx, language and theme
let sfx = localStorage.getItem("sfx") || "static/sfx/click.mp3";
let lang = localStorage.getItem("lang") || "en";
let theme = localStorage.getItem("theme") || "dark";
let langData;

// Stores those variables in localStorage
localStorage.setItem("sfx", sfx);
localStorage.setItem("lang", lang);
localStorage.setItem("theme", theme);

// Changes the textContent of dropdowns depending on language, theme and sfx
document.getElementById("langDropdown").textContent = {
    "en": "English (United Kingdom)", 
    "au": "English (Australia)", 
    "es": "Español", 
    "fr": "Français", 
    "de": "Deutsch",
    "ar": "العربية",
    "ja": "日本語",
    "he": "עברית"
}[lang] || "lang";

document.getElementById("themeDropdown").textContent = {"dark": "Dark", "light": "Light", "pink": "Pink"}[theme] || "theme";
document.getElementById("sfxDropdown").textContent = {
    "static/sfx/click.mp3": "SFX 1",
    "static/sfx/drop.mp3": "SFX 2",
    "static/sfx/snap2.mp3": "SFX 3"
}[sfx] || "sfx";

changeLanguage(lang);
changeTheme();
new Audio(sfx);

// Procedure that plays the sfx
function playSFX() {
    const audioElement = new Audio(sfx);
    audioElement.volume = document.getElementById("slider").value / 100;
    audioElement.play()
}

// Procedure that updates all of the text on the website depending on the language
function updateContent(langData) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        // Figures out which attribute to modify depending on element type
        // i.e. for button input elements, change the value and not the innerHTML
        if (element.matches("input")) {
            if (element.classList.contains("text")) {
                element.placeholder = langData[key];
            } else {
                element.value = langData[key];
            }
        } else {
            element.innerHTML = langData[key];
        }
    });
}

// Procedure that fetches the language json file
async function fetchLanguageData(lang) {
    const response = await fetch(`static/lang/${lang}.json`);
    return response.json();
}

// Procedure that changes the language and flips it horizontally if in an RTL language
// and flips vertically if on the southern hemisphere
async function changeLanguage(lang) {
    langData = await fetchLanguageData(lang);
    updateContent(langData);
    if (lang == "ar" || lang == "he") {
        document.querySelector(':root').style.setProperty("--arabic", "-1");
        document.querySelector(':root').style.setProperty("--australia", "0deg");
        document.getElementById("gameInfoCode").textContent = code + " :" + langData["code"];
        document.getElementById("gameInfoWhite").textContent = "Player 2 :" + langData["white"];
        document.getElementById("gameInfoBlack").textContent = "Player 1 :" + langData["black"];
    } else if (lang == "au") {
        document.querySelector(':root').style.setProperty("--arabic", "1");
        document.querySelector(':root').style.setProperty("--australia", "180deg");
        document.getElementById("gameInfoCode").textContent = langData["code"] + ": " + code;
        document.getElementById("gameInfoWhite").textContent = langData["white"] + ": Player 2";
        document.getElementById("gameInfoBlack").textContent = langData["black"] + ": Player 1";
    } else {
        document.querySelector(':root').style.setProperty("--arabic", "1");
        document.querySelector(':root').style.setProperty("--australia", "0deg");
        document.getElementById("gameInfoCode").textContent = langData["code"] + ": " + code;
        document.getElementById("gameInfoWhite").textContent = langData["white"] + ": Player 2";
        document.getElementById("gameInfoBlack").textContent = langData["black"] + ": Player 1";
    }
}

// Procedure that changes all of the CSS color variables depending on the theme
function changeTheme() {
    if (theme == "dark") {
        document.querySelector(':root').style.setProperty("--bgColor", "#222222");
        document.querySelector(':root').style.setProperty("--txtColor", "#DDDDDD");
        document.querySelector(':root').style.setProperty("--btnColor", "#444444");
        document.querySelector(':root').style.setProperty("--settingsHover", "#474747");
        document.querySelector(':root').style.setProperty("--btnHover", "#696969");
        document.querySelector(':root').style.setProperty("--placeholderColor", "#AAAAAA");
        document.querySelector(':root').style.setProperty("--dropdownColor", "#555555");
        document.querySelector(':root').style.setProperty("--txtInputBgColor", "#DDDDDD");
        document.querySelector(':root').style.setProperty("--txtInputColor", "#444444");
    } else if (theme == "pink") {
        document.querySelector(':root').style.setProperty("--bgColor", "#FF96C4");
        document.querySelector(':root').style.setProperty("--txtColor", "#FFFFFF");
        document.querySelector(':root').style.setProperty("--btnColor", "#FF6193");
        document.querySelector(':root').style.setProperty("--settingsHover", "#FF78BB");
        document.querySelector(':root').style.setProperty("--btnHover", "#FF78BB");
        document.querySelector(':root').style.setProperty("--placeholderColor", "#AAAAAA");
        document.querySelector(':root').style.setProperty("--dropdownColor", "#FF96C4");
        document.querySelector(':root').style.setProperty("--txtInputBgColor", "#DDDDDD");
        document.querySelector(':root').style.setProperty("--txtInputColor", "#444444");
    } else {
        document.querySelector(':root').style.setProperty("--bgColor", "#EEEEEE");
        document.querySelector(':root').style.setProperty("--txtColor", "#474747");
        document.querySelector(':root').style.setProperty("--btnColor", "#FFFFFF");
        document.querySelector(':root').style.setProperty("--settingsHover", "#C7C7C7");
        document.querySelector(':root').style.setProperty("--btnHover", "#C7C7C7");
        document.querySelector(':root').style.setProperty("--placeholderColor", "#AAAAAA");
        document.querySelector(':root').style.setProperty("--dropdownColor", "#EEEEEE");
        document.querySelector(':root').style.setProperty("--txtInputBgColor", "#FFFFFF");
        document.querySelector(':root').style.setProperty("--txtInputColor", "#474747");
    }
}

// Procedure that changes language, theme and sfx when dropdown is clicked
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {getRidOfDropdowns();} else {playSFX()};

    if (event.target.matches("#langDropdownContent a")) {
        if (event.target.matches("#english")) {lang = "en";}
        if (event.target.matches("#australian")) {lang = "au";}
        if (event.target.matches("#spanish")) {lang = "es";}
        if (event.target.matches("#french")) {lang = "fr";}
        if (event.target.matches("#german")) {lang = "de";}
        if (event.target.matches("#arabic")) {lang = "ar";}
        if (event.target.matches("#japanese")) {lang = "ja";}
        if (event.target.matches("#hebrew")) {lang = "he";}
        localStorage.setItem("lang", lang)
        document.getElementById("langDropdown").textContent = event.target.textContent;
    }

    if (event.target.matches("#themeDropdownContent a")) {
        if (event.target.matches("#dark")) {theme = "dark";}
        if (event.target.matches("#light")) {theme = "light";}
        if (event.target.matches("#pink")) {theme = "pink";}
        localStorage.setItem("theme", theme)
        document.getElementById("themeDropdown").textContent = event.target.textContent;
        changeTheme();
    }

    if (event.target.matches("#sfxDropdownContent a")) {
        if (event.target.matches("#sfx1")) {sfx = "static/sfx/click.mp3";}
        if (event.target.matches("#sfx2")) {sfx = "static/sfx/snap2.mp3";}
        if (event.target.matches("#sfx3")) {sfx = "static/sfx/drop.mp3";}
        localStorage.setItem("sfx", sfx)
        document.getElementById("sfxDropdown").textContent = event.target.textContent;
        new Audio(sfx);
    }
}