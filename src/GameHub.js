import React from 'react';
import speakArabic from './utils/speechAR';

export default function GameHub({ onNavigate }) {
  const games = [
    { id: 'snake', title: 'لعبة الثعبان', description: 'تحكم في الثعبان لتأكل الأكل وتجنب الاصطدام.' },
    { id: 'memory', title: 'لعبة الذاكرة', description: 'طابق البطاقات المتشابهة للتقدم في المستويات.' },
  ];

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>بوابة الألعاب</h1>
      <p>اختر لعبة للبدء. اضغط على رمز مكبر الصوت لسماع وصف اللعبة بالعربية.</p>

      <div style={{ display: 'grid', gap: 12, maxWidth: 600 }}>
        {games.map(g => (
          <div key={g.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: '0 0 6px 0' }}>{g.title}</h2>
                <div style={{ color: '#555' }}>{g.description}</div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => speakArabic(g.title + '. ' + g.description)}
                  aria-label={`speak-${g.id}`}
                >
                  🔊
                </button>
                <button onClick={() => onNavigate(g.id)}>{g.id === 'memory' ? 'ابدأ' : 'تشغيل'}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
