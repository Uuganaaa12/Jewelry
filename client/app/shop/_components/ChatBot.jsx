'use client';
import { useState, useRef, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const MODES = [
  { id: 'zero_shot',  label: 'Zero-shot',        color: '#00434D' },
  { id: 'few_shot',   label: 'Few-shot',          color: '#005F6B' },
  { id: 'cot',        label: 'Chain-of-Thought',  color: '#0097A9' },
  { id: 'role_based', label: 'Role-based',        color: '#00B4C8' },
];

function DiamondIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox='0 0 40 40' fill='none'>
      {/* Top facet */}
      <polygon points='20,2 32,14 20,14 8,14' fill='#FFFFFF' opacity='0.9'/>
      {/* Left facet */}
      <polygon points='8,14 20,14 20,38' fill='#0097A9'/>
      {/* Right facet */}
      <polygon points='32,14 20,14 20,38' fill='#00434D'/>
      {/* Top left */}
      <polygon points='2,18 8,14 20,14 12,22' fill='#00B4C8' opacity='0.8'/>
      {/* Top right */}
      <polygon points='38,18 32,14 20,14 28,22' fill='#005F6B' opacity='0.8'/>
    </svg>
  );
}

export default function ChatBot() {
  const [open,    setOpen]    = useState(false);
  const [mode,    setMode]    = useState('zero_shot');
  const [msgs,    setMsgs]    = useState([]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, loading]);

  async function send(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput('');
    const userMsg = { role: 'user', content: text };
    setMsgs(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const history = msgs.slice(-6);
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, mode, history }),
      });
      const data = await res.json();
      setMsgs(prev => [...prev, { role: 'assistant', content: data.reply || data.error }]);
    } catch {
      setMsgs(prev => [...prev, { role: 'assistant', content: 'Алдаа гарлаа. Дахин оролдоно уу.' }]);
    } finally {
      setLoading(false);
    }
  }

  const activeMode = MODES.find(m => m.id === mode);

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 1000,
          width: 340, maxHeight: '70vh',
          display: 'flex', flexDirection: 'column',
          background: '#fff', borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,67,77,0.18)',
          border: '1px solid #e0f0f2', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ background: '#00434D', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <DiamondIcon size={22} />
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '0.05em' }}>Luna AI</div>
                <div style={{ color: '#0097A9', fontSize: 11 }}>Үнэт эдлэлийн туслах</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
          </div>

          {/* Mode selector */}
          <div style={{ display: 'flex', gap: 4, padding: '8px 10px', background: '#f0f9fa', borderBottom: '1px solid #e0f0f2', flexWrap: 'wrap' }}>
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)} style={{
                padding: '4px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                border: `1.5px solid ${m.color}`,
                background: mode === m.id ? m.color : 'transparent',
                color: mode === m.id ? '#fff' : m.color,
                cursor: 'pointer', transition: 'all .15s',
              }}>{m.label}</button>
            ))}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200, maxHeight: 340 }}>
            {msgs.length === 0 && (
              <div style={{ textAlign: 'center', color: '#0097A9', fontSize: 13, marginTop: 20 }}>
                <DiamondIcon size={36} />
                <p style={{ marginTop: 10, fontWeight: 600 }}>Сайн байна уу!</p>
                <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Үнэт эдлэлийн талаар асуугаарай</p>
                <p style={{ fontSize: 11, color: '#0097A9', marginTop: 6 }}>Горим: <strong>{activeMode?.label}</strong></p>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '9px 13px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role === 'user' ? '#00434D' : '#f0f9fa',
                  color: m.role === 'user' ? '#fff' : '#0d0d0d',
                  fontSize: 13, lineHeight: 1.6,
                  border: m.role === 'assistant' ? '1px solid #e0f0f2' : 'none',
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '9px 16px', borderRadius: '16px 16px 16px 4px', background: '#f0f9fa', border: '1px solid #e0f0f2' }}>
                  <span style={{ display: 'inline-flex', gap: 4 }}>
                    {[0,1,2].map(i => (
                      <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#0097A9', display: 'inline-block', animation: `bounce 1s ${i*0.2}s infinite` }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <form onSubmit={send} style={{ display: 'flex', padding: '10px 12px', borderTop: '1px solid #e0f0f2', gap: 8, background: '#fff' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder='Асуулт бичнэ үү...'
              disabled={loading}
              style={{ flex: 1, border: '1.5px solid #e0f0f2', borderRadius: 10, padding: '8px 12px', fontSize: 13, outline: 'none', color: '#0d0d0d' }}
            />
            <button type='submit' disabled={loading || !input.trim()} style={{
              background: '#0097A9', color: '#fff', border: 'none', borderRadius: 10,
              padding: '8px 14px', cursor: 'pointer', fontSize: 16, fontWeight: 700,
              opacity: loading || !input.trim() ? 0.5 : 1,
            }}>→</button>
          </form>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(o => !o)}
        title='Luna AI туслах'
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #00434D 0%, #0097A9 100%)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,67,77,0.35)',
          transition: 'transform .2s, box-shadow .2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,67,77,0.45)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,67,77,0.35)'; }}
      >
        {open ? <span style={{ color: '#fff', fontSize: 22, fontWeight: 300 }}>×</span> : <DiamondIcon size={28} />}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
