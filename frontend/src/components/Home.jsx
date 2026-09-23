export default function Home({ username, setUsername, roomId, setRoomId, createRoom, joinRoom }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', marginTop: '20px' }}>
      
      <div className="game-card" style={{ width: '320px' }}>
        <h2 style={{ textAlign: 'center', marginTop: 0, color: 'var(--text)' }}>Play Game</h2>
        <input 
          className="game-input" 
          placeholder="Enter your name" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          style={{ marginBottom: '20px' }} 
        />
        <button onClick={createRoom} className="game-btn btn-green" style={{ width: '100%' }}>
          Create Room
        </button>
      </div>

      <div className="game-card" style={{ width: '320px' }}>
        <h2 style={{ textAlign: 'center', marginTop: 0, color: 'var(--text)' }}>Join Game</h2>
        <input 
          className="game-input" 
          placeholder="Enter your name" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          style={{ marginBottom: '15px' }} 
        />
        <input 
          className="game-input" 
          placeholder="Room Code (e.g. xyz123)" 
          value={roomId} 
          onChange={(e) => setRoomId(e.target.value)} 
          style={{ marginBottom: '20px', textAlign: 'center', letterSpacing: '2px' }} 
        />
        <button onClick={joinRoom} className="game-btn btn-blue" style={{ width: '100%' }}>
          Join Room
        </button>
      </div>

    </div>
  );
}
