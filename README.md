# Online Backgammon

A lightweight, web-based implementation of the classic board game **Backgammon**, featuring real-time online multiplayer, room allocation, multi-language support, and multiple UI themes. Built as an OCR A Level Computer Science NEA project (check out the writeup [here](NEA.pdf)).

## Key Features

- **Real-Time Multiplayer**: Play online with friends using room codes via WebSocket connections.
- **Multi-Language Support**: Dynamically localized UI with support for 8 languages.
- **Customization Options**: Choose from 3 UI themes and multiple sound effects.
- **Minimalistic Web Design**: Lightweight, minimalistic frontend built with vanilla CSS and JS.

## Tech Stack

- **Backend**: Python, Flask
- **Frontend**: Vanilla JavaScript (ES6+), HTML/CSS

## Project Structure

```text
backgammon/
├── main.py                 # Flask server & Socket.IO event handlers
├── templates/
│   ├── index.html          # Main menu interface
│   └── game.html           # Active game board screen
└── static/
    ├── game.js             # Core Backgammon game logic & rule enforcement
    ├── menu.js             # Main menu navigation & room code handling
    ├── network.js          # Client-side WebSocket event handling
    ├── appearance.js       # Visual customization & theme engine
    ├── settings.js         # Settings & sound preferences
    ├── styles.css          # UI styling & responsive board layout
    ├── assets/             # Game graphics & board textures
    ├── lang/               # Localization JSON files
    └── sfx/                # Game sound effects
```

## Limitations & Missing Features

- **Computer Opponents**: There is no single-player option.
- **Doubling Cube**: The doubling cube, a standard backgammon mechanic, is not present in this project.
- **Drag and Drop**: Pieces can only be moved by clicking on pieces.
- **Resign and Rematch**: The resign button is non-functional.

Please check `NEA.pdf` for a more detailed description of limitations and missing features. 

## Getting Started

### Prerequisites

- Python 3.13+

> Note: This project was definitely coded on an older version of Python, so older versions of Python 3 are very likely to work. However, this project definitely works on Python 3.13.

### Installation
Clone the repository:

```cmd
git clone https://github.com/jaydenshah/online-backgammon.git
cd online-backgammon
```

Create and activate a virtual environment:

```cmd
# macOS/Linux
python -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

Install dependencies:

```cmd
pip install -r requirements.txt
```

Run the application:

```
python main.py
```

Navigate to `http://127.0.0.1:80` in your web browser.