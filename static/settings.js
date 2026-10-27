// Stores and retrieves toggleAnimation setting from localStorage
if (localStorage.getItem("toggleAnimation") === null) {
    document.getElementById("toggleAnimation").checked = true;
    localStorage.setItem("toggleAnimation", "true");
} else {
    document.getElementById("toggleAnimation").checked = localStorage.getItem("toggleAnimation") === "true";
}
// Changes the animation time depending on the toggleAnimation setting
if (document.getElementById("toggleAnimation").checked == true) {
    document.querySelector(':root').style.setProperty("--time", ".4s");
} else {
    document.querySelector(':root').style.setProperty("--time", "0s");
}

// Stores and retrieves volume setting from localStorage
if (localStorage.getItem("volume") === null) {
    document.getElementById("slider").value = 100;
    localStorage.setItem("volume", "100");
} else {
    document.getElementById("slider").value = parseInt(localStorage.getItem("volume"));
}

// Procedure that gets rid of dropdown menus
function getRidOfDropdowns() {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
        }
    }
}

// Procedure that opens a dropdown
function openDropdown(dropdown) {
    if (document.getElementById(dropdown + "Content").classList.contains("show")) {
        getRidOfDropdowns();
    } else {
        getRidOfDropdowns();
        document.getElementById(dropdown + "Content").classList.add("show");
    }
}

// Procedure that runs when user opens settings popup
document.getElementById("settings").addEventListener("click", () => {
    document.getElementById("modal").style.transform = "translateY(0px)";
    document.getElementById("modal").style.visibility = "visible";
    document.getElementById("modal").classList.add("modalAppear");
    document.getElementById("modal").classList.remove("modalDisappear");
    playSFX();
});

// Procedure that runs when user closes settings popup
document.getElementById("close").addEventListener("click", () => {
    document.getElementById("modal").style.transform = "translateY(-100vh)";
    document.getElementById("modal").style.visibility = "hidden";
    document.getElementById("modal").classList.add("modalDisappear");
    document.getElementById("modal").classList.remove("modalAppear");
    playSFX();
});

// Procedure that toggles animation
document.getElementById("toggleAnimation").addEventListener("click", () => {
    if (document.getElementById("toggleAnimation").checked == true) {
        document.querySelector(':root').style.setProperty("--time", ".4s");
    } else {
        document.querySelector(':root').style.setProperty("--time", "0s");
    }
    localStorage.setItem("toggleAnimation", document.getElementById("toggleAnimation").checked.toString());
    playSFX();
});

// Procedure that saves the volume setting to localStorage
document.getElementById("slider").addEventListener("mouseup", () => {
    localStorage.setItem("volume", document.getElementById("slider").value.toString());
})