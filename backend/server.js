const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Player, Room } = require('./models');

const app = express();
app.use(cors());
const server = http.createServer(app);

// UPDATED FOR DEPLOYMENT: Allow all origins so Vercel can connect
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] } 
});

const rooms = new Map(); 
const wordsList = ["apple", "banana", "cat", "dog", "elephant", "house", "car", "tree", "mountain", "guitar"];

function advanceTurn(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    room.game.drawerIndex++;
    
    if (room.game.drawerIndex >= room.players.length) {
        room.game.drawerIndex = 0;
        room.game.currentRound++;
    }
    
    if (room.game.currentRound > room.game.rounds) {
        room.game.phase = "game_over";
        io.in(roomId).emit('game_over', room.players);
    } else {
        room.game.phase = "selecting_word";
        const nextDrawer = room.getDrawer();
        const shuffled = wordsList.sort(() => 0.5 - Math.random());
        room.game.wordOptions = shuffled.slice(0, 3);
        
        io.to(roomId).emit('round_start', { 
            drawerId: nextDrawer.id, 
            drawerName: nextDrawer.name,
            wordOptions: room.game.wordOptions
        });
    }
}

io.on('connection', (socket) => {
    socket.on('create_room', (data, callback) => {
        const maxPlayers = Math.max(2, Math.min(20, parseInt(data.settings?.maxPlayers) || 8));
        const rounds = Math.max(2, Math.min(10, parseInt(data.settings?.rounds) || 3));
        const drawTime = Math.max(15, Math.min(240, parseInt(data.settings?.drawTime) || 60));

        const validatedSettings = { maxPlayers, rounds, drawTime };
        const roomId = Math.random().toString(36).substring(2, 8);
        const host = new Player(socket.id, data.username);
        
        const newRoom = new Room(roomId, host, validatedSettings);
        rooms.set(roomId, newRoom);
        socket.join(roomId);
        callback({ roomId, roomState: newRoom });
    });

    socket.on('join_room', (data, callback) => {
        const room = rooms.get(data.roomId);
        if (!room) return callback({ error: "Room not found" });
        
        const newPlayer = new Player(socket.id, data.username);
        if (!room.addPlayer(newPlayer)) return callback({ error: "Room is full" });

        socket.join(data.roomId);
        io.to(data.roomId).emit('player_joined', room.players);
        callback({ roomId: data.roomId, roomState: room });
    });

    socket.on('start_game', (roomId) => {
        const room = rooms.get(roomId);
        if (room && room.hostId === socket.id) {
            room.game.phase = "selecting_word";
            const drawer = room.getDrawer();
            const shuffled = wordsList.sort(() => 0.5 - Math.random());
            room.game.wordOptions = shuffled.slice(0, 3);
            
            io.to(roomId).emit('round_start', { 
                drawerId: drawer.id, 
                drawerName: drawer.name,
                wordOptions: room.game.wordOptions
            });
        }
    });

    socket.on('word_chosen', (data) => {
        const room = rooms.get(data.roomId);
        if (room) {
            room.game.currentWord = data.word;
            room.game.phase = "drawing";
            io.to(data.roomId).emit('start_drawing');

            clearInterval(room.game.timerId);
            room.game.timeLeft = room.game.drawTime;
            io.to(data.roomId).emit('timer_update', room.game.timeLeft);

            room.game.timerId = setInterval(() => {
                room.game.timeLeft--;
                io.to(data.roomId).emit('timer_update', room.game.timeLeft);

                if (room.game.timeLeft <= 0) {
                    clearInterval(room.game.timerId);
                    io.in(data.roomId).emit('chat_message', { 
                        sender: 'System', 
                        text: `Time's up! The word was ${room.game.currentWord}` 
                    });
                    setTimeout(() => advanceTurn(data.roomId), 3000);
                }
            }, 1000);
        }
    });

    socket.on('draw_move', (data) => socket.to(data.roomId).emit('draw_data', data));
    socket.on('clear_canvas', (data) => socket.to(data.roomId).emit('clear_canvas'));
    socket.on('undo_canvas', (data) => socket.to(data.roomId).emit('undo_canvas', data.canvasState));

    socket.on('guess', (data) => {
        const room = rooms.get(data.roomId);
        if (!room) return;

        if (data.text.trim().toLowerCase() === room.game.currentWord && room.game.timeLeft > 0) {
            clearInterval(room.game.timerId); 
            
            const guesser = room.players.find(p => p.name === data.playerName);
            const drawer = room.getDrawer();
            
            if (guesser) guesser.score += 10;
            if (drawer) drawer.score += 5;

            io.in(data.roomId).emit('guess_result', { playerName: data.playerName, word: room.game.currentWord });
            io.in(data.roomId).emit('player_joined', room.players); 
            
            setTimeout(() => advanceTurn(data.roomId), 3000);
        } else {
            io.in(data.roomId).emit('chat_message', { sender: data.playerName, text: data.text });
        }
    });

    socket.on('disconnect', () => {
        rooms.forEach((room, roomId) => {
            room.removePlayer(socket.id);
            if (room.players.length === 0) {
                clearInterval(room.game.timerId); 
                rooms.delete(roomId);
            } else {
                io.to(roomId).emit('player_left', room.players);
            }
        });
    });
});

// UPDATED FOR DEPLOYMENT: Dynamically bind to Render's assigned port
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
