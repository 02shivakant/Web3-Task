import { useState, useEffect, useRef } from 'react';

export default function Chat({ socket, roomId, username }) {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.on('chat_message', (data) => {
      setChatLog((prev) => [...prev, { ...data, type: 'chat' }]);
    });

    socket.on('guess_result', (data) => {
      setChatLog((prev) => [...prev, { sender: data.playerName, text: `Guessed the word!`, type: 'success' }]);
    });

    return () => {
      socket.off('chat_message');
      socket.off('guess_result');
    };
  }, [socket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    socket.emit('guess', { roomId, text: message, playerName: username });
    setMessage('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '450px' }}>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'var(--surface)' }}>
        {chatLog.map((msg, index) => (
          <div key={index} style={{ 
            padding: '8px 12px', borderRadius: '6px', fontSize: '14px',
            backgroundColor: msg.type === 'success' ? '#D4EDDA' : (index % 2 === 0 ? 'white' : '#F4F4F4'),
            border: msg.type === 'success' ? '1px solid #C3E6CB' : '1px solid #E0E0E0',
            color: msg.type === 'success' ? '#155724' : 'var(--text)',
            fontWeight: msg.type === 'success' ? '900' : 'bold'
          }}>
            <strong style={{ color: msg.sender === username ? 'var(--accent)' : 'var(--muted)' }}>
              {msg.sender}: 
            </strong> <span style={{ wordBreak: 'break-word', fontWeight: msg.type === 'success' ? '900' : 'normal' }}>{msg.text}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', padding: '10px', backgroundColor: '#F0F0F0', borderTop: '2px solid #E0E0E0' }}>
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Type guess here..."
          maxLength="50"
          className="game-input"
          style={{ flex: 1, padding: '10px', marginRight: '10px' }}
        />
        <button type="submit" className="game-btn btn-green" style={{ padding: '10px 15px' }}>Send</button>
      </form>
    </div>
  );
}
