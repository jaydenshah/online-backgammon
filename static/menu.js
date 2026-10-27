// Initialises variables for menu, code, name
// and whether the user is creating or joining a room
let menu = "mainMenu";
let choice = null;
let code = "";
let name = "";
let closeError;
const socket = io({autoConnect: false});
updateMenu();

// Procedure that displays and hides elements depenging on menu
function updateMenu() {
    // Removes user input from text inputs
    document.getElementById("codeInput").value = "";
    document.getElementById("nameInput").value = "";

    // Displays/hides title depending on menu
    for (let element of document.getElementsByClassName("titleText")) {
        if (["mainMenu", "codeMenu", "nameMenu"].includes(menu)) {
            element.style.display = "block";
        } else {
            element.style.display = "none";
        } 
    }
    
    // Displays/hides code text depending on menu
    if (["codeTextMenu"].includes(menu)) {
        document.getElementById("codeText").style.display = "block";
    } else {
        document.getElementById("codeText").style.display = "none";
    }
    
    // Displays/hides menu buttons depending on menu
    for (let element of document.getElementsByClassName("menuButton")) {
        if (["mainMenu"].includes(menu)) {
            element.style.display = "block";
        } else {
            element.style.display = "none";
        } 
    }
    
    // Displays/hides code input buttons depending on menu
    for (let element of document.getElementsByClassName("codeButton")) {
        if (["codeMenu"].includes(menu)) {
            element.style.display = "block";
        } else {
            element.style.display = "none";
        } 
    }
    
    // Displays/hides name input buttons depending on menu
    for (let element of document.getElementsByClassName("nameButton")) {
        if (["nameMenu"].includes(menu)) {
            element.style.display = "block";
        } else {
            element.style.display = "none";
        } 
    }
    
    // Displays/hides back button depending on menu
    if (["codeMenu", "nameMenu"].includes(menu)) {
        document.getElementById("back").style.display = "block";
    } else {
        document.getElementById("back").style.display = "none";
    }   
}

// Procedure that displays an error
function showError(text) {
    document.getElementById("errorText").textContent = text;

    if (document.getElementById("errorBanner").classList.contains("errorAppear")) {
        clearTimeout(closeError);
        document.getElementById("errorBanner").classList.remove("errorAppear");;
    }

    // for whatever reason, I have to remove the errorAppear class and add it again
    // 10ms later so the animation plays
    setTimeout(function() {
        document.getElementById("errorBanner").style.transform = "translateY(0px)";
        document.getElementById("errorBanner").style.visibility = "visible";
        document.getElementById("errorBanner").classList.add("errorAppear");
        document.getElementById("errorBanner").classList.remove("errorDisappear");
    }, 10);
    
    closeError = setTimeout(function (){
        document.getElementById("errorBanner").style.transform = "translateY(20vh)";
        document.getElementById("errorBanner").style.visibility = "hidden";
        document.getElementById("errorBanner").classList.add("errorDisappear");
        document.getElementById("errorBanner").classList.remove("errorAppear");
    }, 3000)
}

// Procedure that runs when user creates a room
document.getElementById("menuCreate").addEventListener("click", () => {
    menu = "nameMenu";
    choice = "create";
    updateMenu();
    playSFX();
});

// Procedure that runs when user joins a room
document.getElementById("menuJoin").addEventListener("click", () => {
    menu = "codeMenu";
    choice = "join";
    updateMenu();
    playSFX();
});

// Procedure that runs when user submits a code
document.getElementById("codeSubmit").addEventListener("click", () => {
    code = document.getElementById("codeInput").value;

    for (let letter of code) {
        if (!"0123456789".includes(letter)) {
            code = "";
            showError(langData["numbersError"]);
            return;
        }
    }
    if (code.length != 6) {
        code = "";
        showError(langData["sixDigitError"]);
        return;
    }

    menu = "nameMenu";
    updateMenu();
    playSFX();
});

document.getElementById("codeInput").addEventListener("keydown", () => {
    if (sfx != "static/sfx/click.mp3") {playSFX();}
});

document.getElementById("nameInput").addEventListener("keydown", () => {
    if (sfx != "static/sfx/click.mp3") {playSFX();}
});

// Procedure that runs when user submits a username
document.getElementById("nameSubmit").addEventListener("click", () => {
    name = document.getElementById("nameInput").value;

    for (let letter of name) {
        if (!"abcdefghijklmnopqrstuvwxyz0123456789 ".includes(letter.toLowerCase())) {
            name = "";
            showError(langData["alphanumericError"]);
            return;
        }
    }
    if (name.length == 0) {
        showError(langData["usernameError"]);
        return;
    }

    if (choice == "create") {
        menu = "codeTextMenu";
        document.getElementById("code").textContent = "------";
        updateMenu();
        playSFX();

        // Creates a waiting room
        socket.connect();

        socket.emit("create_waiting_room", name);

        // Updates UI upon receiving a room code
        socket.on("receive_room_code", (room_code) => {
            code = room_code;
            document.getElementById("code").textContent = room_code;
        });

        // Leaves the waiting room and joins a room when other opponent joins
        socket.on("join_room", (userid) => {
            sessionStorage.setItem("userid", userid);
            window.location.replace("/" + code);
        });
    } else if (choice == "join") {
        // Checks if the room exists first
        fetch(`exists/${code}`)
        .then((response) => response.json())
        .then((response_json) => {
            if (response_json.exists) {
                // Creates a game room
                socket.connect();

                socket.emit("create_room", code, name);

                // When the server sets up the game room, the client joins the game room
                socket.on("join_room", (userid) => {
                    sessionStorage.setItem("userid", userid);
                    window.location.replace("/" + code);
                });
            } else {
                showError("Room does not exist");
            }
        })
    }
});

// Procedure that runs when user clicks the back button
document.getElementById("back").addEventListener("click", () => {
    if (menu == "nameMenu" && choice == "join") {
        menu = "codeMenu";
        updateMenu();
    } else {
        menu = "mainMenu";
        choice = null;
        updateMenu();
    }
    code = "";
    name = "";
    playSFX();
});