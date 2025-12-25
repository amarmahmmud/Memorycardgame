import React, { useState } from 'react';
import GameHub from './src/GameHub';
import SnakeGame from './src/SnakeGame';

export default function App() {
  const [view, setView] = useState('hub'); // 'hub' | 'snake' | 'memory'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: 40 }}>
      <div style={{ width: 900 }}>
        {view === 'hub' && <GameHub onNavigate={(id) => setView(id)} />}
        {view === 'snake' && <SnakeGame onExit={() => setView('hub')} />}
        {view === 'memory' && (
          <div style={{ padding: 20 }}>
            <h2>لعبة الذاكرة</h2>
            <p>تم توجيهك إلى لعبة الذاكرة — إذا كانت موجودة في المشروع، افتحها من هنا أو اترك هذا المكان لدمج اللعبة الحالية.</p>
            <button onClick={() => setView('hub')}>العودة</button>
          </div>
        )}
      </div>
    </div>
  );
}
