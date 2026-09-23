import { useRef, useState, useEffect } from 'react';

const COLORS = ['#000000', '#FFFFFF', '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF', '#8B4513'];

export default function Canvas({ socket, roomId, isDrawer }) {
  const canvasRef = useRef(null);
  const historyRef = useRef([]); 
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    historyRef.current.push(canvas.toDataURL());
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    saveCanvasState();

    socket.on('draw_data', (data) => {
      ctx.lineWidth = data.size;
      ctx.lineCap = 'round';
      ctx.strokeStyle = data.color;
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
    });

    socket.on('clear_canvas', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveCanvasState();
    });

    socket.on('undo_canvas', (canvasState) => {
      const img = new Image();
      img.src = canvasState;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    });

    return () => {
      socket.off('draw_data');
      socket.off('clear_canvas');
      socket.off('undo_canvas');
    };
  }, [socket]);

  const startDrawing = (e) => {
    if (!isDrawer) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    saveCanvasState(); 
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    socket.emit('draw_move', { roomId, x, y, color, size: brushSize });
  };

  const clearCanvas = () => {
    if (!isDrawer) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveCanvasState();
    socket.emit('clear_canvas', { roomId });
  };

  const undoStroke = () => {
    if (!isDrawer || historyRef.current.length <= 1) return;
    historyRef.current.pop(); 
    const previousState = historyRef.current[historyRef.current.length - 1]; 
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = previousState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    socket.emit('undo_canvas', { roomId, canvasState: previousState });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      
      <canvas
        ref={canvasRef}
        width={650}
        height={450}
        style={{ cursor: isDrawer ? 'crosshair' : 'default', display: 'block', margin: '0 auto' }}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onMouseOut={stopDrawing}
      />

      <div style={{ backgroundColor: '#F0F0F0', borderTop: '2px solid #E0E0E0', padding: '10px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: isDrawer ? 1 : 0.4, pointerEvents: isDrawer ? 'auto' : 'none' }}>
        
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', width: '120px' }}>
          {COLORS.map(c => (
            <div 
              key={c} 
              onClick={() => setColor(c)}
              style={{ width: '24px', height: '24px', backgroundColor: c, borderRadius: '4px', cursor: 'pointer', border: color === c ? '3px solid var(--accent)' : '1px solid #CCC', boxSizing: 'border-box' }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: brushSize + 'px', height: brushSize + 'px', backgroundColor: color, borderRadius: '50%' }} />
          <input type="range" min="2" max="30" value={brushSize} onChange={(e) => setBrushSize(e.target.value)} style={{ width: '80px' }} />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setColor('#ffffff')} className="game-btn" style={{ padding: '8px 12px', fontSize: '14px', backgroundColor: 'white', color: 'var(--text)', border: '2px solid #ccc' }}>Eraser</button> 
          <button onClick={undoStroke} className="game-btn btn-yellow" style={{ padding: '8px 12px', fontSize: '14px' }}>Undo</button>
          <button onClick={clearCanvas} className="game-btn btn-red" style={{ padding: '8px 12px', fontSize: '14px' }}>Clear</button>
        </div>

      </div>
    </div>
  );
}
