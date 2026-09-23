import Canvas from '../Canvas';
import Chat from '../Chat';

export default function Game({ socket, roomId, username, players, gamePhase, isDrawer, wordOptions, chooseWord, timeLeft }) {
  
  const renderOverlay = () => {
    if (gamePhase === "selecting_word") {
      return (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: '8px' }}>
          {isDrawer ? (
            <>
              <h2 style={{ fontSize: '32px', marginBottom: '30px' }}>CHOOSE A WORD</h2>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {wordOptions.map(word => (
                  <button key={word} onClick={() => chooseWord(word)} className="game-btn btn-blue" style={{ fontSize: '24px' }}>
                    {word}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <h2 style={{ fontSize: '28px', color: 'var(--muted)' }}>Drawer is choosing a word...</h2>
          )}
        </div>
      );
    }
    
    if (gamePhase === "game_over") {
      return (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: '8px' }}>
          <h1 style={{ fontSize: '48px', margin: 0, color: 'var(--text)' }}>🏆 GAME OVER</h1>
          <h2 style={{ fontSize: '32px', color: 'var(--warning)' }}>Winner: {players[0]?.name}</h2>
          <button onClick={() => window.location.reload()} className="game-btn btn-green" style={{ marginTop: '30px' }}>Return to Lobby</button>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      <div className="game-card" style={{ padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '900' }}>
        <div style={{ fontSize: '18px' }}>Round <span style={{ color: 'var(--accent)' }}>X</span></div>
        <div style={{ fontSize: '24px', letterSpacing: '4px' }}>
          {gamePhase === "selecting_word" ? "PICK A WORD" : "_ _ _ _ _"}
        </div>
        <div style={{ fontSize: '22px' }}>
          ⏱ <span style={{ color: 'var(--danger)' }}>{gamePhase === 'drawing' ? timeLeft : '--'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        <div className="game-card" style={{ width: '220px', padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ backgroundColor: '#F4F4F4', padding: '12px', borderBottom: '2px solid #E0E0E0', fontWeight: '900', textAlign: 'center', color: 'var(--muted)' }}>PLAYERS</div>
          <div>
            {players.sort((a,b) => b.score - a.score).map((p, index) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', backgroundColor: index % 2 === 0 ? 'white' : '#F9F9F9', borderBottom: '1px solid #EEE' }}>
                <span style={{ fontWeight: p.name === username ? '900' : 'bold', color: p.name === username ? 'var(--accent)' : 'var(--text)' }}>
                  <span style={{ color: 'var(--muted)', marginRight: '5px' }}>#{index + 1}</span> 
                  {p.name}
                </span>
                <span style={{ fontWeight: '900' }}>{p.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="game-card" style={{ padding: '0', flex: '1 1 auto', minWidth: '300px', maxWidth: '650px', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {renderOverlay()}
          
          <div style={{ width: '100%', overflowX: 'auto', backgroundColor: 'white' }}>
            <Canvas socket={socket} roomId={roomId} isDrawer={isDrawer} />
          </div>
        </div>

        <div className="game-card" style={{ width: '300px', padding: '0', flex: '1 1 auto', maxWidth: '350px' }}>
          <Chat socket={socket} roomId={roomId} username={username} />
        </div>
      </div>
    </div>
  );
}
