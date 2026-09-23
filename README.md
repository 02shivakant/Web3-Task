# Skribbl.io Clone

A full-stack, real-time multiplayer drawing and guessing game built with React, Node.js, and Socket.IO.

## 🚀 Live Demo
* **Frontend (Vercel):** `[Your Vercel URL will go here]`
* **Backend (Render):** `[Your Render URL will go here]`

## ✨ Features
* **Custom Game Rooms:** Hosts can configure Max Players, Number of Rounds, and Draw Time.
* **Real-Time Canvas:** Synchronized drawing with color palettes, brush sizing, undo history, and clear canvas functionality.
* **Turn-Based Gameplay:** Automatic turn rotation, word selection from 3 random choices, and synchronized server-side draw-time countdowns.
* **Live Chat & Scoring:** Case-insensitive guessing, real-time score calculation based on speed, and automatic winner announcements.

## 🛠️ Tech Stack
* **Frontend:** React, Vite, Canvas API, CSS3
* **Backend:** Node.js, Express.js, Socket.IO v4
* **State Management:** In-memory OOP data structures (Maps and Classes)

## 🏗️ Architecture & Game State
The backend avoids databases in favor of fast, in-memory Object-Oriented models to manage real-time state:
* `Room`: Manages the lobby, player limits, configurations, and instances the `Game` class.
* `Game`: Tracks the current round, draw time, selected word, active drawer index, and timer intervals.
* `Player`: Tracks individual socket IDs, usernames, and scores.
* **WebSockets (Socket.IO):** Handles all low-latency events including `draw_move`, `chat_message`, `timer_update`, and `round_start`.

## 💻 Local Setup Instructions

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)
* Git

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/skribbl-clone.git
cd skribbl-clone
\`\`\`

### 2. Start the Backend
\`\`\`bash
cd backend
npm install
node server.js
\`\`\`
*The server will start on http://localhost:3001*

### 3. Start the Frontend
Open a new terminal window:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
*The React app will start on http://localhost:5173*
