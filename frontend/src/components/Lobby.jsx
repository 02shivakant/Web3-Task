export default function Lobby({ roomId, players, isHost, settings, setSettings, startGame, username }) {
  const copyCode = () => navigator.clipboard.writeText(roomId);

  return (
    <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
      
      <div className="game-card" style={{ width: '350px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ margin: '0 0 20px 0' }}>Room Settings</h2>
        
        <div style={{ backgroundColor: '#f4f4f4', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
          <span style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Room Code</span>
          <div style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '3px', margin: '5px 0' }}>{roomId}</div>
          <button onClick={copyCode} style={{ padding: '5px 10px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}>Copy Code</button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold' }}>Max Players</label>
            <input type="number" min="2" max="20" value={settings.maxPlayers} disabled={!isHost} onChange={(e) => setSettings({...settings, maxPlayers: e.target.value})} className="game-input" style={{ width: '80px', padding: '8px' }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold' }}>Rounds</label>
            <input type="number" min="2" max="10" value={settings.rounds} disabled={!isHost} onChange={(e) => setSettings({...settings, rounds: e.target.value})} className="game-input" style={{ width: '80px', padding: '8px' }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold' }}>Draw Time (s)</label>
            <input type="number" min="15" max="240" value={settings.drawTime} disabled={!isHost} onChange={(e) => setSettings({...settings, drawTime: e.target.value})} className="game-input" style={{ width: '80px', padding: '8px' }}/>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          {isHost ? (
            <button onClick={startGame} className="game-btn btn-green" style={{ width: '100%' }}>Start Game</button>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--danger)', fontWeight: 'bold', padding: '12px', backgroundColor: '#FDECEE', borderRadius: '8px' }}>Waiting for host to start...</div>
          )}
        </div>
      </div>

      <div className="game-card" style={{ width: '350px' }}>
        <h2 style={{ margin: '0 0 20px 0', display: 'flex', justifyContent: 'space-between' }}>
          Players <span>{players.length} / {settings.maxPlayers}</span>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
          {players.map((p, idx) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 15px', backgroundColor: p.name === username ? '#E6F2FF' : '#F9F9F9', borderRadius: '8px', border: p.name === username ? '2px solid var(--accent)' : '2px solid transparent', fontWeight: 'bold' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#ccc', marginRight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ flex: 1 }}>{p.name} {p.name === username && "(You)"}</span>
              {idx === 0 && <span title="Host" style={{ fontSize: '18px' }}>👑</span>}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
