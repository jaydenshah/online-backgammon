// Creates a socket
const socket = io();

// Requests information about the game from the server
// (what pieces are on the board, who's white, who's black)
socket.emit("receive_game_info", sessionStorage.getItem("userid"));

// Redirects to main menu if the server sends a redirect request
socket.on("redirect_home", () => {
    window.location.replace("/");
});

// Function that resets the usernames and adds winner and loser prefixes
function resetUsernames() {
    let winPrefix = "<span style='color: green;'>Winner</span> - ";
    let losePrefix = "<span style='color: red;'>Loser</span> - ";

    // Checks if there is no winner
    if (winner == null) {
        if (color == "white") {
            document.getElementById("player1").textContent = black;
            document.getElementById("player2").textContent = white;
        } else {
            document.getElementById("player2").textContent = black;
            document.getElementById("player1").textContent = white;
        }
    // Checks if the winner is white
    } else if (winner == "white") {
        if (color == "white") {
            document.getElementById("player1").innerHTML = losePrefix + black;
            document.getElementById("player2").innerHTML = winPrefix + white;
        } else {
            document.getElementById("player2").innerHTML = losePrefix + black;
            document.getElementById("player1").innerHTML = winPrefix + white;
        }
    // Checks if the winner is black
    } else {
        if (color == "white") {
            document.getElementById("player1").innerHTML = winPrefix + black;
            document.getElementById("player2").innerHTML = losePrefix + white;
        } else {
            document.getElementById("player2").innerHTML = winPrefix + black;
            document.getElementById("player1").innerHTML = losePrefix + white;
        }
    }
}

// Processes game information from the server, updates UI and changes data in Board class
socket.on("game_info", (data) => {
    game.dice.hideRollDiceButton = false;

    color = data["color"];
    white = data["white"];
    black = data["black"];
    winner = data["winner"];
    game.turn = data["turn"];
    game.dice.activeDice = data["activeDice"];
    game.validMoves = data["validMoves"];
    game.whiteData = data["whiteData"];
    game.blackData = data["blackData"];

    if (game.dice.activeDice.length == 0) {
        game.dice.dice1 = NaN;
        game.dice.dice2 = NaN;
    }
    
    if ((color != game.turn && game.dice.activeDice.length == 0) || winner != null) {
        game.dice.hideRollDiceButton = true;
    } else if (game.dice.activeDice.length > 0) {
        try {
            game.dice.dice1 = game.dice.activeDice[0];
        } catch {}
        try {
            game.dice.dice2 = game.dice.activeDice[1];
        } catch {}
        game.dice.hideRollDiceButton = true;
        game.dice.hideDice = false;
    }

    // Changes player names in gameInfo section
    if (lang == "ar" || lang == "he") {
        document.getElementById("gameInfoWhite").textContent = white + " :" + langData["white"];
        document.getElementById("gameInfoBlack").textContent = black + " :" + langData["black"];
    } else {
        document.getElementById("gameInfoWhite").textContent = langData["white"] + ": " + white;
        document.getElementById("gameInfoBlack").textContent = langData["black"] + ": " + black;
    }

    // Changes player names around board
    resetUsernames();
    
    document.getElementById("gameInfoTurn").textContent = game.turn == color ? langData["yourTurn"] : langData["waitingForOpponent"];

    // Changes data in Board class
    game.board.board = data["board"];
});

// Procedure that updates UI when opponent disconnects and reconnects
socket.on("opponent_disconnected", () => {
    resetUsernames();
    document.getElementById("player1").innerHTML = document.getElementById("player1").innerHTML + " <span style='color: red;'>(disconnected)</span>";
});
socket.on("opponent_reconnected", () => {
    resetUsernames();
});

// Procedure that runs when server responds with a dice roll
socket.on("receive_roll_dice", (activeDice) => {
    game.dice.activeDice = activeDice;
    if (game.frame < game.dice.diceRollStop) {
        game.dice.diceRollStop = game.dice.diceRollStart + Math.max(29, Math.ceil((game.frame - game.dice.diceRollStart) / 3 + 0.1) * 3 - 1)
    } else {
        game.dice.startRoll(false);
    }

    socket.emit("receive_game_info", sessionStorage.getItem("userid"));
});

// Procedure that runs when server responds with a piece move
socket.on("receive_make_move", () => {
    socket.emit("receive_game_info", sessionStorage.getItem("userid"));
});