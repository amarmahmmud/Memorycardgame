import React, { useRef, useEffect, useState } from 'react';
import speakArabic from './utils/speechAR';

const CELL_SIZE = 20;
const WIDTH = 400;
const HEIGHT = 400;

function randomPosition() {
  const cols = Math.floor(WIDTH / CELL_SIZE);
  const rows = Math.floor(HEIGHT / CELL_SIZE);
  return {
    x: Math.floor(Math.random() * cols) * CELL_SIZE,
    y: Math.floor(Math.random() * rows) * CELL_SIZE,
  };
}

export default function SnakeGame({ onExit }) {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{ x: 0, y: 0 }]);
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState(randomPosition());
  const [speed, setSpeed] = useState(120);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);

  useEffect(() => {
    speakArabic('ابدأ لعبة الثعبان');
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      const k = e.key;
      if (k === 'ArrowUp' && dir.y === 0) setDir({ x: 0, y: -1 });
      if (k === 'ArrowDown' && dir.y === 0) setDir({ x: 0, y: 1 });
      if (k === 'ArrowLeft' && dir.x === 0) setDir({ x: -1, y: 0 });
      if (k === 'ArrowRight' && dir.x === 0) setDir({ x: 1, y: 0 });
      if (k === ' ' || k === 'Enter') setRunning(r => !r);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSnake(prev => {
        const head = { x: prev[0].x + dir.x * CELL_SIZE, y: prev[0].y + dir.y * CELL_SIZE };
        // wrap-around bounds
        if (head.x < 0) head.x = WIDTH - CELL_SIZE;
        if (head.y < 0) head.y = HEIGHT - CELL_SIZE;
        if (head.x >= WIDTH) head.x = 0;
        if (head.y >= HEIGHT) head.y = 0;

        // collision with self
        for (let i = 0; i < prev.length; i++) {
          if (prev[i].x === head.x && prev[i].y === head.y) {
            speakArabic('انتهت اللعبة. نقاطك ' + score);
            setRunning(false);
            return prev; // stop moving
          }
        }

        let newSnake = [head, ...prev];
        // food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 1);
          speakArabic('أكلت تفاحة. نقطتك الآن ' + (score + 1));
          setFood(randomPosition());
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, speed);
    return () => clearInterval(id);
  }, [dir, running, food, score, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    function draw() {
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      // draw food
      ctx.fillStyle = 'red';
      ctx.fillRect(food.x, food.y, CELL_SIZE, CELL_SIZE);
      // draw snake
      ctx.fillStyle = 'lime';
      snake.forEach((s, idx) => {
        ctx.fillStyle = idx === 0 ? '#0f0' : '#6f6';
        ctx.fillRect(s.x, s.y, CELL_SIZE - 1, CELL_SIZE - 1);
      });
    }
    draw();
  }, [snake, food]);

  return (
    <div style={{ padding: 12, fontFamily: 'sans-serif' }}>
      <h2>لعبة الثعبان</h2>
      <div style={{ marginBottom: 8 }}>استخدم مفاتيح الأسهم للتحكم. اضغط مسافة أو Enter للإيقاف/التشغيل.</div>
      <div style={{ display: 'flex', gap: 16 }}>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ background: '#111' }} />
        <div>
          <div>النقاط: {score}</div>
          <div style={{ height: 8 }} />
          <button onClick={() => { setSnake([{ x: 0, y: 0 }]); setDir({ x: 1, y: 0 }); setFood(randomPosition()); setScore(0); setRunning(true); speakArabic('أعدت تشغيل اللعبة'); }}>إعادة</button>
          <div style={{ height: 8 }} />
          <button onClick={() => { setRunning(r => !r); speakArabic(running ? 'إيقاف مؤقت' : 'استمرار'); }}>{running ? 'إيقاف' : 'استمرار'}</button>
          <div style={{ height: 8 }} />
          <button onClick={() => onExit()}>العودة</button>
        </div>
      </div>
    </div>
  );
}
