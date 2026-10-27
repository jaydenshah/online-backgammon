// Scale variable, value that determines how much to scale the canvas by
let scale = 1;

// Pixel function, recalculates every coordinate value (n) depending on size of canvas
function pixel(n) {
    return Math.floor(n * scale);
}

// Resize function, runs when the window is resized, recalculates scale variable
// changes the canvas dimensions and changes the height of the game info box
function resize() {
    scale = Math.min(window.innerWidth / 1536, window.innerHeight / 730);
    canvas.width = pixel(852);
    canvas.height = pixel(500);
    document.getElementById("gameInfo").style.height = pixel(500).toString() + "px";
}

// Board class, contains board data and functions for rendering
class Board {
    constructor() {
        // Board data is an array with 24 elements (for 24 points on a Backgammon board)
        // Each point stores 2 values: the number of pieces and the color of pieces
        this.board = [];

        this.img = new Image();
        this.img.src = "static/assets/board.png";
    }

    // Renders the board
    renderBoard() {
        ctx.drawImage(this.img, 0, 0, pixel(852), pixel(500));
    }

    // Renders a piece
    renderPiece(x, y, color, highlight=0) {
        highlight = game.frame < game.dice.diceRollStop ? 0 : highlight;

        if (color == "black") {
            ctx.fillStyle = "#000000";
        } else {
            ctx.fillStyle = "#ffffff";
        }

        // Draws a circle with centre x, y and radius 20px
        ctx.beginPath();
        ctx.arc(pixel(x), pixel(y), pixel(20), 0, 2 * Math.PI);
        ctx.fill();
        
        // Draws an outline for the circle
        if (highlight == 1) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#FFFF00";
        } else if (highlight == 2) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#0000FF";
        } else {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#000000";
        }
        
        ctx.stroke();
        ctx.closePath(); 
    }
    // Renders point highlights
    renderPointHighlight(point) {
        let intervalsTop = [0, 56, 111, 167, 224, 280];
        let intervalsBottom = [0, 57, 113, 171, 226, 281];
        let x, y;

        if (point == null) {
            ctx.beginPath();
            ctx.rect(pixel(792), pixel(game.turn == "white" ? 289 : 56), pixel(40), pixel(150));
            ctx.closePath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#FFFF00";
            ctx.stroke();
        } else {
            // Calculates x and y values
            if (point >= 12 && point <= 17) {
                x = 66 + intervalsTop[point - 12];
            } else if (point >= 18 && point <= 23){
                x = 458 + intervalsTop[point - 18];
            } else if (point >= 6 && point <= 11) {
                x = 66 + intervalsBottom[11 - point];
            } else {
                x = 458 + intervalsBottom[5 - point];
            }
            
            if (point >= 12) {
                y = 199;
            } else {
                y = 297;
            }
    
            // Draws a yellow triangle outline
            ctx.beginPath();
            ctx.moveTo(pixel(x), pixel(y));
            ctx.lineTo(pixel(x - 18), pixel(y - 180 * (point >= 12 ? 1 : -1)));
            ctx.lineTo(pixel(x + 18), pixel(y - 180 * (point >= 12 ? 1 : -1)));
            ctx.closePath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#FFFF00";
            ctx.stroke();
        }
    }

    // Calculates where each piece should be and renders them
    renderPieces() {
        // Render black bar pieces
        for (let i = 0; i < game.blackData.onBar; i++) {
            let x = 400;
            let y = 158 + i * Math.min(40, 40 / (game.blackData.onBar - 1));
            if (i == game.blackData.onBar - 1 && selectedPoint == "blackBar") {
                this.renderPiece(x, y, "black", 1);
                for (let move of game.validMoves) {
                    if (move.from == null) {
                        this.renderPointHighlight(move.to);
                    }
                }
            // Long if statement just checks if a valid move exists that starts from the black bar
            } else if (i == game.blackData.onBar - 1 && selectedPoint == null && Array.from({length: game.validMoves.length}, (_, i) => game.validMoves[i].from).includes(null) && game.turn == "black") {
                this.renderPiece(x, y, "black", 2);
            } else {
                this.renderPiece(x, y, "black");
            }
        }

        // Renders white bar pieces
        for (let i = 0; i < game.whiteData.onBar; i++) {
            let x = 400;
            let y = 340 - i * Math.min(40, 40 / (game.whiteData.onBar - 1));
            if (i == game.whiteData.onBar - 1 && selectedPoint == "whiteBar") {
                this.renderPiece(x, y, "white", 1);
                for (let move of game.validMoves) {
                    if (move.from == null) {
                        this.renderPointHighlight(move.to);
                    }
                }
            // Long if statement just checks if a valid move exists that starts from the white bar
            } else if (i == game.whiteData.onBar - 1 && selectedPoint == null && Array.from({length: game.validMoves.length}, (_, i) => game.validMoves[i].from).includes(null) && game.turn == "white") {
                this.renderPiece(x, y, "white", 2);
            } else {
                this.renderPiece(x, y, "white");
            }
        }

        // Renders white borne off pieces
        if (game.whiteData.borneOff > 0) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.rect(pixel(792), pixel(439 - 10 * game.whiteData.borneOff), pixel(40), pixel(10 * game.whiteData.borneOff));
            ctx.closePath();
            ctx.fill();
        }
        // Renders black borne off pieces
        if (game.blackData.borneOff > 0) {
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.rect(pixel(792), pixel(56), pixel(40), pixel(10 * game.blackData.borneOff));
            ctx.closePath();
            ctx.fill();
        }

        let tmp = game.turn == "white" ? this.board.toReversed() : this.board;

        tmp.forEach((point, index) => {
            if (game.turn == "white") {
                index = 23 - index;
            }
            
            if (point.count > 0) {
                // The gaps between points at the top and bottom because
                // for some reason, they aren't perfectly equidistant
                let intervalsTop = [0, 56, 111, 167, 224, 280];
                let intervalsBottom = [0, 57, 113, 171, 226, 281];
                let x, y;

                // Calculates x axis depending on which point it is
                if (index >= 12 && index <= 17) {
                    x = 66 + intervalsTop[index - 12];
                } else if (index >= 18 && index <= 23){
                    x = 458 + intervalsTop[index - 18];
                } else if (index >= 6 && index <= 11) {
                    x = 66 + intervalsBottom[11 - index];
                } else {
                    x = 458 + intervalsBottom[5 - index];
                }

                // Calculates y axis depending on where the piece is within the point
                for (let i = 0; i < point.count; i++) {
                    if (index >= 12) {
                        y = 38 + i * Math.min(40, 120 / (point.count - 1));
                    } else {
                        y = 460 - i * Math.min(40, 120 / (point.count - 1));
                    }
                    
                    if (i == point.count - 1 && selectedPoint == index) {
                        this.renderPiece(x, y, point.color, 1);
                        for (let move of game.validMoves) {
                            if (move.from == index) {
                                this.renderPointHighlight(move.to);
                            }
                        }
                    } else if (i == point.count - 1 && selectedPoint == null && Array.from({length: game.validMoves.length}, (_, i) => game.validMoves[i].from).includes(index)) {
                        this.renderPiece(x, y, point.color, 2);
                    } else {
                        this.renderPiece(x, y, point.color);
                    }
                }  
            }
        });
    }
}

class Dice {
    constructor() {
        // dice roll start and stop are set to frame numbers that control when the animation plays
        this.dice1 = NaN;
        this.dice2 = NaN;
        this.activeDice = [];
        this.diceRollStart = NaN;
        this.diceRollStop = NaN;
        this.hideDice = true;
        this.hideRollDiceButton = true;

        this.rollDiceButtonImg = new Image();
        this.rollDiceButtonImg.src = "static/assets/rollDiceButton.png";
        this.diceImg = new Image();
        this.diceImg.src = "static/assets/dice.png";
        }

    // Rolls the dice
    // (visually changes the dice if final is false otherwise it actually changes)
    rollDice(final=true) {
        if (final) {
            this.dice1 = this.activeDice[0];
            this.dice2 = this.activeDice[1];
        } else {
            let newDice1 = Math.floor(Math.random() * 6);
            let newDice2 = Math.floor(Math.random() * 6);

            while (newDice1 == this.dice1) {
                newDice1 = Math.floor(Math.random() * 6);
            }
            while (newDice2 == this.dice2) {
                newDice2 = Math.floor(Math.random() * 6);
            }

            this.dice1 = newDice1;
            this.dice2 = newDice2;
        }
    }

    // Animates the dice
    animateDice() {
        if ((game.frame - this.diceRollStart) % 3 == 0 && game.frame >= this.diceRollStart && game.frame <= this.diceRollStop) {
            this.rollDice(false, false);
        }
        if (game.frame == this.diceRollStop + 1) {
            this.rollDice();
            console.log(game.dice.activeDice);
            console.log(game.validMoves);
        }
    }

    // Renders the dice and the roll dice button
    displayDice() {
        this.animateDice();

        if (!this.hideRollDiceButton) {
            ctx.drawImage(this.rollDiceButtonImg, pixel(126), pixel(217), pixel(169), pixel(59));
        }

        if (!this.hideDice) {
            ctx.drawImage(this.diceImg, 64 * this.dice1, 0, 64, 64, pixel(525), pixel(215), pixel(64), pixel(64));
            ctx.drawImage(this.diceImg, 64 * this.dice2, 0, 64, 64, pixel(605), pixel(215), pixel(64), pixel(64));
        }
    }

    // Changes attributes and starts the roll when the roll dice button is clicked
    // doServerStuff determines whether a roll_dice request should be sent to the server
    startRoll(doServerStuff=true) {
        this.hideRollDiceButton = true;
        this.hideDice = false;
        this.diceRollStart = game.frame;
        if (doServerStuff) {
            this.diceRollStop = Number.POSITIVE_INFINITY;
            socket.emit("roll_dice", sessionStorage.getItem("userid"));
        } else {
            this.diceRollStop = game.frame + 29;
        }
        
    }
}
// Game class, currently it only contains the board
// In the future, it will contain players, selected pieces, valid move calculations etc.
class Game {
    constructor() {
        this.board = new Board();
        this.dice = new Dice();
        this.frame = 0;
        this.turn = "white";
        this.validMoves = [];
        this.whiteData = {"onBar": 0, "borneOff": 0};
        this.blackData = {"onBar": 0, "borneOff": 0};
    }
}

function handleClick(event) {
    const x = event.clientX - canvas.offsetLeft;
    const y = event.clientY - canvas.offsetTop;
    console.log(x, y);

    let point = null;
    if (x >= pixel(48) && x <= pixel(364)) {
        if (y > pixel(16) && y < pixel(200)) {
            for (let i = 0; i < 6; i++) {
                if (x >= pixel(48 + 56 * i) && x <= pixel(84 + 56 * i)) {
                    point = 12 + i;
                    break;
                }
            }
        } else if (y > pixel(296) && y < pixel(479)) {
            for (let i = 0; i < 6; i++) {
                if (x >= pixel(48 + 56 * i) && x <= pixel(84 + 56 * i)) {
                    point = 11 - i;
                    break;
                }
            }
        }
    } else if (x >= pixel(440) && x <= pixel(756)) {
        if (y > pixel(16) && y < pixel(200)) {
            for (let i = 0; i < 6; i++) {
                if (x >= pixel(440 + 56 * i) && x <= pixel(476 + 56 * i)) {
                    point = 18 + i;
                    break;
                }
            }
        } else if (y > pixel(296) && y < pixel(479)) {
            for (let i = 0; i < 6; i++) {
                if (x >= pixel(440 + 56 * i) && x <= pixel(476 + 56 * i)) {
                    point = 5 - i;
                    break;
                }
            }
        }
    }

    let onWhiteBar = x >= pixel(380) && y >= pixel(280) && x <= pixel(420) && y <= pixel(360);
    let onBlackBar = x >= pixel(380) && y >= pixel(138) && x <= pixel(420) && y <= pixel(218);

    let onWhiteHole = x >= pixel(792) && y >= pixel(289) && x <= pixel(832) && y <= pixel(439);
    let onBlackHole = x >= pixel(792) && y >= pixel(56) && x <= pixel(832) && y <= pixel(206);

    // Handles what actions are performed depending on what the user clicked
    if (selectedPoint == null) {
        if (point != null) {
            if (Array.from({length: game.validMoves.length}, (_, i) => game.validMoves[i].from).includes(point)) {
                // Selects piece only if the piece has a valid move
                selectedPoint = point;
            }
        } else if (Array.from({length: game.validMoves.length}, (_, i) => game.validMoves[i].from).includes(null) && onWhiteBar && game.turn == "white") {
            selectedPoint = "whiteBar";
        } else if (Array.from({length: game.validMoves.length}, (_, i) => game.validMoves[i].from).includes(null) && onBlackBar && game.turn == "black") {
            selectedPoint = "blackBar";
        }
    } else {
        if (point != null && point != selectedPoint && game.validMoves.reduce((acc, move) => acc = acc || (move.from == (["whiteBar", "blackBar"].includes(selectedPoint) ? null : selectedPoint) && move.to == point), false)) {
            // Moves only if a point was selected and move is legal
            socket.emit("make_move", sessionStorage.getItem("userid"), {from: ["whiteBar", "blackBar"].includes(selectedPoint) ? null : selectedPoint, to: point});
            selectedPoint = null;
            return;
        } else if (Array.from({length: game.validMoves.length}, (_, i) => game.validMoves[i].to).includes(null) && (onWhiteHole && game.turn == "white") || (onBlackHole && game.turn == "black")) {
            socket.emit("make_move", sessionStorage.getItem("userid"), {from: selectedPoint, to: null});
            selectedPoint = null;
            return;
        }
        if (point != null && point == selectedPoint || point == null && ["whiteBar", "blackBar"].includes(selectedPoint)) {
            selectedPoint = null;
            return;
        }

        // Unselects the piece
        selectedPoint = null;

        // Reselects another piece if the user unselected the piece by selecting another valid piece
        if (point != null) {
            if (Array.from({length: game.validMoves.length}, (_, i) => game.validMoves[i].from).includes(point)) {
                selectedPoint = point;
            } 
        } else if (Array.from({length: game.validMoves.length}, (_, i) => game.validMoves[i].from).includes(null) && onWhiteBar && game.turn == "white") {
            selectedPoint = "whiteBar";
        } else if (Array.from({length: game.validMoves.length}, (_, i) => game.validMoves[i].from).includes(null) && onBlackBar && game.turn == "black") {
            selectedPoint = "blackBar";
        }
    }

    if (x >= pixel(126) && y >= pixel(217) && x < pixel(295) && y < pixel(276) && !game.dice.hideRollDiceButton) {
        game.dice.startRoll();
    }
}

// Initialise JS canvas and game object
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let game = new Game();
let selectedPoint = null;
let code = window.location.pathname.replace("/", "");
let color;
let white;
let black;
let winner;
resize();

let lastframe = performance.now()
// Function that renders the game on the canvas
function draw() {
    game.board.renderBoard();
    game.board.renderPieces();
    game.dice.displayDice();
    console.log(1000 / (performance.now() - lastframe))
    lastframe = performance.now()
    game.frame += 1;
}

// Calls the draw function every 33ms (to run at roughly 30fps)
const interval = setInterval(draw, 33);
window.addEventListener("resize", () => {resize()});
document.addEventListener("click", handleClick, false);

// Procedure that sends the user back to the main menu
document.getElementById("gameInfoMainMenu").addEventListener("click", () => {
    sessionStorage.removeItem("userid");
    window.location.replace("/");
});

document.getElementById("gameInfoResign").addEventListener("click", () => {
    socket.emit("resign", sessionStorage.getItem("userid"));
});