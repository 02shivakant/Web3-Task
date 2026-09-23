import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './index.css'; 
import Home from './components/Home';
import Lobby from './components/Lobby';
import Game from './components/Game';

// =========================================================
// DEPLOYMENT INSTRUCTION: 
// Once you deploy the backend to Render, replace the link below 
// with your actual Render URL (e.g., "https://skribbl-clone-123.onrender.com")
// =========================================================
const BACKEND_URL = "https://web3-task.onrender.com"; 
const socket = io(BACKEND_URL);

export default function App() {
  const [status, setStatus] = useState("Connecting...");
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isInRoom, setIsInRoom] = useState(false);
  const [settings, setSettings] = useState({ maxPlayers: 8, rounds: 3, drawTime: 60 });

  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [gamePhase, setGamePhase] = useState("lobby"); 
  const [isDrawer, setIsDrawer] = useState(false);
  const [wordOptions, setWordOptions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    socket.on("connect", () => setStatus("Connected to Server"));
    socket.on("player_joined", (playerList) => setPlayers(playerList));
    socket.on("player_left", (playerList) => setPlayers(playerList));

    socket.on("timer_update", (time) => setTimeLeft(time));

    socket.on("round_start", ({ drawerId, wordOptions }) => {
      setGamePhase("selecting_word");
      if (drawerId === socket.id) {
        setIsDrawer(true);
        setWordOptions(wordOptions);
      } else {
        setIsDrawer(false);
      }
    });

    socket.on("start_drawing", () => setGamePhase("drawing"));
    
    socket.on("game_over", (finalPlayers) => {
      setGamePhase("game_over");
      setPlayers(finalPlayers);
    });

    return () => {
      socket.off("connect");
      socket.off("player_joined");
      socket.off("player_left");
      socket.off("timer_update");
      socket.off("round_start");
      socket.off("start_drawing");
      socket.off("game_over");
    };
  }, []);

  const createRoom = () => {
    if (!username.trim()) return alert("Enter a username!");
    socket.emit("create_room", { username, settings }, (response) => {
      setRoomId(response.roomId);
      setIsInRoom(true);
      setIsHost(true);
      setPlayers([{ id: socket.id, name: username, score: 0 }]);
    });
  };

  const joinRoom = () => {
    if (!username.trim() || !roomId.trim()) return alert("Enter username and Room Code!");
    socket.emit("join_room", { roomId, username }, (response) => {
      if (response.error) return alert(response.error);
      setIsInRoom(true);
      setPlayers(response.roomState.players);
    });
  };

  const startGame = () => socket.emit("start_game", roomId);
  const chooseWord = (word) => socket.emit("word_chosen", { roomId, word });

  return (
    <div>
      <header style={{ textAlign: 'center', padding: '30px 0 20px 0' }}>
        <h1 style={{ color: 'white', fontSize: '3.5rem', margin: '0', textShadow: '0px 4px 0px rgba(0,0,0,0.2)' }}>Skribbl Clone</h1>
        <p style={{ color: '#A0C4FF', margin: '5px 0 0 0', fontWeight: 'bold' }}>{status}</p>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px 20px' }}>
        {!isInRoom ? (
          <Home 
            username={username} setUsername={setUsername}
            roomId={roomId} setRoomId={setRoomId}
            createRoom={createRoom} joinRoom={joinRoom}
          />
        ) : gamePhase === "lobby" ? (
          <Lobby 
            roomId={roomId} players={players} isHost={isHost} 
            settings={settings} setSettings={setSettings} 
            startGame={startGame} username={username}
          />
        ) : (
          <Game 
            socket={socket} roomId={roomId} username={username}
            players={players} gamePhase={gamePhase} 
            isDrawer={isDrawer} wordOptions={wordOptions} 
            chooseWord={chooseWord} timeLeft={timeLeft}
          />
        )}
      </main>
    </div>
  );
}
