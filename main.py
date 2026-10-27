from flask import Flask, Blueprint, render_template, request, jsonify, redirect
from flask_socketio import SocketIO, emit, join_room, leave_room, rooms
import random

main = Blueprint("main", __name__)

# Variables that set up waiting rooms, game rooms and connected users
waiting_rooms = {}
game_rooms = {}
users = {}

# Serves the menu
@main.route("/")
def index():
    return render_template("index.html")

# Serves the game page
@main.route("/<string:room_code>")
def game(room_code):
    return render_template("game.html")

# Endpoint that checks whether a room, where an opponent is waiting, exists
@main.route("/exists/<string:room_code>")
def exists(room_code):
    if int(room_code) in waiting_rooms:
        return jsonify({"exists": True})
    else:
        return jsonify({"exists": False})

socketio = SocketIO()

# Listens for when a client connects
@socketio.on("connect")
def handle_connect():
    print(f"{request.remote_addr} has connected!")
    
# Listens for when a client disconnects
@socketio.on("disconnect")
def handle_disconnect():
    print(f"{request.remote_addr} has disconnected!")
    
    # Removes the waiting room the client created, if they created one
    for room in waiting_rooms:
        if users[waiting_rooms[room]]["sid"] == request.sid:
            waiting_rooms.pop(room, None)
            break
        
    # Emits an opponent_disconnected event to the opponent
    for user_id in users:
        if users[user_id]["sid"] == request.sid:
            for game in game_rooms:
                if game_rooms[game]["white"] == user_id:
                    emit("opponent_disconnected", to=users[game_rooms[game]["black"]]["sid"])
                    break
                elif game_rooms[game]["black"] == user_id:
                    emit("opponent_disconnected", to=users[game_rooms[game]["white"]]["sid"])
                    break
            break
    
# Listens for when a client creates a waiting room
@socketio.on("create_waiting_room")
def handle_create_waiting_room(username):
    # Generates a unique random 6 digit code
    code = random.randint(100000, 999999)
    while code in waiting_rooms or code in game_rooms:
        code = random.randint(100000, 999999)
        
    # Creates a waiting room and user
    waiting_rooms[code] = request.sid
    users[request.sid] = {"sid": request.sid, "username": username, "code": None, "color": None, "onBar": 0, "borneOff": 0}
    print(f"{request.remote_addr} has created a room with code {code}")
    
    # Sends the room code back to the client
    emit("receive_room_code", f"{code}")
    
# Listens for when a client creates a room
@socketio.on("create_room")
def handle_create_room(code, username):
    code = int(code)
    
    # Creates a user
    users[request.sid] = {"sid": request.sid, "username": username, "code": code, "color": None, "onBar": 0, "borneOff": 0}
    users[waiting_rooms[code]]["code"] = code
    
    # Creates a game room
    game_rooms[code] = {"activeDice": [], "turn": "white", "validMoves": []}
    
    # Randomly assigns white and black to the connected users
    if random.randint(0, 1):
        game_rooms[code]["white"] = request.sid
        game_rooms[code]["black"] = waiting_rooms[code]
        
        users[request.sid]["color"] = "white"
        users[waiting_rooms[code]]["color"] = "black"
    else:
        game_rooms[code]["white"] = waiting_rooms[code]
        game_rooms[code]["black"] = request.sid
        
        users[waiting_rooms[code]]["color"] = "white"
        users[request.sid]["color"] = "black"
        
    # Board data
    game_rooms[code]["board"] = [
        {"count": 2, "color": "black"},
        {"count": 0, "color": None},
        {"count": 0, "color": None},
        {"count": 0, "color": None},
        {"count": 0, "color": None},
        {"count": 5, "color": "white"},
        {"count": 0, "color": None},
        {"count": 3, "color": "white"},
        {"count": 0, "color": None},
        {"count": 0, "color": None},
        {"count": 0, "color": None},
        {"count": 5, "color": "black"},
        {"count": 5, "color": "white"},
        {"count": 0, "color": None},
        {"count": 0, "color": None},
        {"count": 0, "color": None},
        {"count": 3, "color": "black"},
        {"count": 0, "color": None},
        {"count": 5, "color": "black"},
        {"count": 0, "color": None},
        {"count": 0, "color": None},
        {"count": 0, "color": None},
        {"count": 0, "color": None},
        {"count": 2, "color": "white"}
    ]
    
    # Tells the clients to join the room the server set up
    emit("join_room", request.sid)
    emit("join_room", waiting_rooms[code], to=users[waiting_rooms[code]]["sid"])
    
# Receives game information
@socketio.on("receive_game_info")
def handle_receive_game_info(userid):
    # Checks if the code is a number
    try:
        code = users[userid]["code"]
    except:
        emit("redirect_home") 
        
    # Checks the code is valid and verifies the user can view the web page
    # Only the users who created and joined the room should be able to view the web page
    if code in game_rooms:
        if game_rooms[code]["white"] == userid or game_rooms[code]["black"] == userid:
            # Sets up game data
            game_data = {
                "color": users[userid]["color"], 
                "white": users[game_rooms[code]["white"]]["username"], 
                "black": users[game_rooms[code]["black"]]["username"],
                "whiteData": {"onBar": users[game_rooms[code]["white"]]["onBar"], "borneOff": users[game_rooms[code]["white"]]["borneOff"]},
                "blackData": {"onBar": users[game_rooms[code]["black"]]["onBar"], "borneOff": users[game_rooms[code]["black"]]["borneOff"]},
                "board": game_rooms[code]["board"],
                "activeDice": game_rooms[code]["activeDice"],
                "turn": game_rooms[code]["turn"],
                "validMoves": game_rooms[code]["validMoves"] if users[userid]["color"] == game_rooms[code]["turn"] else [],
                "winner": None
            }
        
        # Checks if someone has won and sets the winner variable accordingly    
        for color in ["white", "black"]:
            if users[game_rooms[code][color]]["borneOff"] >= 15:
                game_data["winner"] = color
                game_data["turn"] = color
                break
        
        if game_rooms[code]["white"] == userid:
            # Updates the user sid and emits game data to the user
            users[userid]["sid"] = request.sid
            emit("game_info", game_data)
            
            # Emits to the opponent that the opponent has reconnected
            emit("opponent_reconnected", to=users[game_rooms[code]["black"]]["sid"])
        elif game_rooms[code]["black"] == userid:
            # Updates the user sid and emits game data to the user
            users[userid]["sid"] = request.sid
            emit("game_info", game_data)
            
            # Emits to the opponent that the opponent has reconnected
            emit("opponent_reconnected", to=users[game_rooms[code]["white"]]["sid"])
        else:
           emit("redirect_home") 
    else:
        emit("redirect_home")

# Rolls dice        
@socketio.on("roll_dice")
def handle_roll_dice(userid):
    # Checks the userid is valid and retrieves the code of the game the user is in
    try:
        code = users[userid]["code"]
    except:
        emit("redirect_home")
        
    if users[userid]["color"] != game_rooms[code]["turn"]:
        return
    
    # Generates random dice    
    active_dice = [random.randint(0, 5), random.randint(0, 5)]
    if active_dice[0] == active_dice[1]:
        active_dice += [active_dice[0], active_dice[0]]
    
    # Updates game dice values    
    game_rooms[code]["activeDice"] = active_dice
    
    # Calculate valid moves
    calculateValidMoves(code)
    
    # Sends a response to the client
    emit("receive_roll_dice", active_dice, to=everyone_in_room(int(code)))

# Makes a move    
@socketio.on("make_move")
def handle_make_move(userid, move):
    # Checks the userid is valid and retrieves the code of the game the user is in
    try:
        code = users[userid]["code"]
    except:
        emit("redirect_home")
        
    if users[userid]["color"] != game_rooms[code]["turn"]:
        return
    
    # Checks whether move is in valid moves     
    for valid_move in game_rooms[code]["validMoves"]:
        if valid_move["from"] == move["from"] and valid_move["to"] == move["to"]:
            board = game_rooms[code]["board"]
            turn = game_rooms[code]["turn"]
            
            # Moves a piece from one point to another
            if move["to"] != None:
                board[move["to"]]["count"] += 1
                if board[move["to"]]["color"] == None:
                    board[move["to"]]["color"] = turn
                
                # Captures piece    
                if board[move["to"]]["count"] == 2 and board[move["to"]]["color"] != turn:
                    board[move["to"]]["count"] = 1
                    board[move["to"]]["color"] = turn
                    users[game_rooms[code]["black" if turn == "white" else "white"]]["onBar"] += 1
            else:
                users[game_rooms[code][turn]]["borneOff"] += 1
            
            if move["from"] == None:
                if turn == "white":
                    users[game_rooms[code]["white"]]["onBar"] -= 1
                else:
                    users[game_rooms[code]["black"]]["onBar"] -= 1
            # Moves a piece from one point to another
            elif board[move["from"]]["count"] > 0 and board[move["from"]]["color"] == turn:
                board[move["from"]]["count"] -= 1
                
                if board[move["from"]]["count"] == 0:
                    board[move["from"]]["color"] = None
                        
            for n in valid_move["dice"].copy():
                game_rooms[code]["activeDice"].remove(n)
             
            # Calculates valid moves   
            calculateValidMoves(code)
            
            # If no valid moves, remove all dice rolls to make the game think your turn is over
            if len(game_rooms[code]["validMoves"]) == 0:
                game_rooms[code]["activeDice"] = []
            
            # Switch turn
            if len(game_rooms[code]["activeDice"]) == 0:
                game_rooms[code]["turn"] = "white" if turn == "black" else "black"
                    
            break
        
    emit("receive_make_move", to=everyone_in_room(int(code)))
    
@socketio.on("resign")
def handle_resign(userid):
    try:
        code = users[userid]["code"]
    except:
        emit("redirect_home")
        
# Listens for when a client sends a message
@socketio.on("send")
def handle_send(data):
    client_rooms = [room for room in rooms() if room != request.sid]
    print(f"Message received: {data}")
    
    if len(client_rooms) == 0:
        emit("receive", f"The server has received your message, which is {data}")
    else:
        emit("receive", f"The server has received your message, which is {data}", to=client_rooms[0])
    
# Listens for when a client joins a room
@socketio.on("join")
def handle_join(data):
    client_rooms = [room for room in rooms() if room != request.sid]
    for room in client_rooms:
        leave_room(room)
        
    join_room(data)
    print(f"A client has joined room {data}")    

# Gets session ids of everyone in a room
def everyone_in_room(code):
    return [users[game_rooms[code]["white"]]["sid"], users[game_rooms[code]["black"]]["sid"]]

# Calculates valid moves
def calculateValidMoves(code):
    # Get variables from the game
    game = game_rooms[code]
    active_dice = game["activeDice"]
    turn = game["turn"]
    compound_move_distances = []
    game["validMoves"] = []
    canBearOff = False
    
    # If there are no dice rolls remaining, there are no valid moves
    if len(active_dice) == 0:
        return
    
    # Checks whether the player can bear off pieces
    low = None
    high = None
    for i, point in enumerate(game["board"]):
        if point["color"] == turn:
            if low == None:
                low = i
            high = i
            
    if high == None:
        return
        
    if (high <= 5 and turn == "white") or (low >= 18 and turn == "black"):
        canBearOff = True
    
    # Handles weird rule in backgammon
    # i.e. when white can bear off and he rolls a 6 but all pieces are on positions 0-4, he must bear off a piece from 4
    # https://www.gnu.org/software/gnubg/manual/html_node/Bearing-Off.html    
    for dice in active_dice:
        if turn == "white":
            if dice > high:
                move = {"from": high, "to": None, "dice": [dice]}
                if move not in game["validMoves"]:
                    game["validMoves"].append(move)
        else:
            if 23 - dice < low:
                move = {"from": low, "to": None, "dice": [dice]}
                if move not in game["validMoves"]:
                    game["validMoves"].append(move)
                    
    # Check if compound moves need to be checked (i.e. moving 7 when rolling 3 and 4)     
    if len(active_dice) >= 2:
        if active_dice[0] != active_dice[1]:
            compound_move_distances.append(sum(active_dice) + 1)
        else:
            for i in range(2, len(active_dice) + 1):
                # If you roll [2, 2], compound moves should be [4, 6, 8]
                # Since doubled dice gives you 4 moves
                compound_move_distances.append((active_dice[0] + 1) * i - 1)
    
    # Checks if there are no pieces on bar               
    if (turn == "black" and users[game["black"]]["onBar"] == 0) or (turn == "white" and users[game["white"]]["onBar"] == 0):
        for i, point in enumerate(game["board"]):
            # Goes through every point of the same color of whoever's turn it is
            if point["color"] == game["turn"]:
                # Goes through every dice roll
                for dice in game["activeDice"]:
                    endpoint = i - (dice + 1) if game["turn"] == "white" else i + (dice + 1)
                    
                    # Checks if piece goes to a legal spot
                    if (endpoint in range(24) and canBearOff == False) or (endpoint in range(-1, 25) and canBearOff == True):
                        # Checks if piece isn't taken off and adds it to validMoves
                        if endpoint not in [-1, 24]:
                            if game["board"][endpoint]["count"] < 2 or game["board"][endpoint]["color"] == game["turn"]:
                                move = {"from": i, "to": endpoint, "dice": [dice]}
                                
                                if move not in game["validMoves"]:
                                    game["validMoves"].append(move)
                        # Checks if piece is taken off and adds it to validMoves
                        # Sets "to" attribute to None to indicate the piece is being taken off
                        else:
                            move = {"from": i, "to": None, "dice": [dice]}
                            
                            if move not in game["validMoves"]:
                                game["validMoves"].append(move)
    else:
        # If pieces are on active bar, you only need to moves from the bar
        for dice in game["activeDice"]:
            endpoint = 24 - (dice + 1) if game["turn"] == "white" else dice
            
            # If piece move does not go off board and the piece moves to a legal spot
            # add move to validMoves
            if endpoint in range(24):
                if game["board"][endpoint]["count"] < 2 or game["board"][endpoint]["color"] == game["turn"]:
                    move = {"from": None, "to": endpoint, "dice": [dice]}
                    
                    if move not in game["validMoves"]:
                        game["validMoves"].append(move)
    
    # Checks whether compound moves are legal by checking length of active dice and number of pieces on bar
    if len(active_dice) >= 2 and (turn == "black" and users[game["black"]]["onBar"] <= 1) or (turn == "white" and users[game["white"]]["onBar"] <= 1):        
        # Goes through every movable point of whoever's turn it is                                       
        for i in [move["from"] for move in game["validMoves"]]:
            # Goes through every compound dice roll
            for distance in compound_move_distances:
                i = 24 if i == None and turn == "white" else (-1 if i == None and turn == "black" else i)
                endpoint = i - (distance + 1) if game["turn"] == "white" else i + (distance + 1)
            
                # Checks if piece goes to a legal spot
                tmp = len(game["validMoves"])
                if (endpoint in range(24) and canBearOff == False) or (endpoint in range(-1, 25) and canBearOff == True):
                    # Checks if piece isn't taken off and adds it to valid moves
                    if endpoint not in [-1, 24]:
                        if game["board"][endpoint]["count"] < 2 or game["board"][endpoint]["color"] == game["turn"]:
                            # Stupidly long line just figures out dice required
                            # Made complex because of doubled dice
                            move = {"from": None if i == 24 or i == -1 else i, "to": endpoint, "dice": active_dice if active_dice[0] != active_dice[1] else [active_dice[0] for j in range((distance + 1) // (active_dice[0] + 1))]}
                            
                            if move not in game["validMoves"]:
                                game["validMoves"].append(move)
                    # Checks if piece is taken off and adds it to validMoves
                    # Sets "to" attribute to None to indicate the piece is being taken off
                    else:
                        move = {"from": None if i == 24 or i == -1 else i, "to": None, "dice": active_dice if active_dice[0] != active_dice[1] else [active_dice[0] for j in range((distance + 1) // (active_dice[0] + 1))]}
                     
                        if move not in game["validMoves"]:
                            game["validMoves"].append(move)
                    
                if tmp == len(game["validMoves"]):
                    break

# Web server config
app = Flask(__name__)
app.config["SECRET_KEY"] = "248f9ce1-93d1-484f-8ec3-3b2ae097b6d8"
app.config["DEBUG"] = True

app.register_blueprint(main)

# Connects web server and socket
socketio.init_app(app)
socketio.run(app, host="0.0.0.0", port=80)