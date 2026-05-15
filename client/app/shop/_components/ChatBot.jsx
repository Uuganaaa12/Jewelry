'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const STORAGE_KEY = 'luna_chat_history';

const MODES = [
  { id: 'zero_shot',  label: 'Zero-shot' },
  { id: 'few_shot',   label: 'Few-shot' },
  { id: 'cot',        label: 'Chain-of-Thought' },
  { id: 'role_based', label: 'Role-based' },
];

function DiamondIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox='0 0 60 60' fill='none'>
      <polygon points='30,4 50,22 30,22 10,22' fill='#FFFFFF' opacity='0.95'/>
      <polygon points='6,22 30,4 10,22' fill='#0097A9'/>
      <polygon points='54,22 30,4 50,22' fill='#00434D'/>
      <polygon points='30,4 50,22 30,22' fill='#FFFFFF' opacity='0.25'/>
      <line x1='6' y1='22' x2='54' y2='22' stroke='#FFFFFF' strokeWidth='0.5' opacity='0.4'/>
      <polygon points='10,22 30,56 30,22' fill='#0097A9'/>
      <polygon points='50,22 30,56 30,22' fill='#00434D'/>
      <polygon points='10,22 18,34 30,22' fill='#00B4C8' opacity='0.7'/>
      <polygon points='50,22 42,34 30,22' fill='#002D36' opacity='0.7'/>
      <polygon points='18,34 30,56 30,22' fill='#005F6B' opacity='0.6'/>
      <polygon points='42,34 30,56 30,22' fill='#003A44' opacity='0.6'/>
      <polygon points='22,22 38,22 30,10' fill='#FFFFFF' opacity='0.3'/>
    </svg>
  );
}

function ProductCard({ product }) {
  const router = useRouter();
  const price = product.saleActive && product.salePrice ? product.salePrice : product.price;
  const img = product.images?.[0];

  return (
    <div
      onClick={() => router.push(`/products/${product._id}`)}
      style={{
        flexShrink: 0, width: 140, cursor: 'pointer',
        border: '1px solid #d0eaed', borderRadius: 10, overflow: 'hidden',
        background: '#fff', transition: 'box-shadow .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,67,77,0.18)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ width: '100%', height: 110, background: '#f4fbfc', overflow: 'hidden' }}>
        {img
          ? <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DiamondIcon size={32}/></div>
        }
      </div>
      <div style={{ padding: '8px 10px' }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#0d0d0d', lineHeight: 1.3, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {product.name}
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#00434D' }}>
          {price?.toLocaleString('mn-MN')}₮
        </div>
        {product.saleActive && product.salePrice && (
          <div style={{ fontSize: 10, color: '#b33a3a', textDecoration: 'line-through' }}>
            {product.price?.toLocaleString('mn-MN')}₮
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCarousel({ products }) {
  if (!products?.length) return null;
  return (
    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, paddingTop: 2, scrollbarWidth: 'thin', scrollbarColor: '#d0eaed transparent' }}>
      {products.map(p => <ProductCard key={p._id} product={p} />)}
    </div>
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
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setMsgs(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (msgs.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-50)));
    } catch {}
  }, [msgs]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, loading]);

  function clearHistory() {
    setMsgs([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  async function send(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput('');
    setMsgs(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, mode, history: msgs.slice(-6) }),
      });
      const data = await res.json();
      setMsgs(prev => [...prev, {
        role: 'assistant',
        content: data.reply || data.error,
        products: data.products || [],
      }]);
    } catch {
      setMsgs(prev => [...prev, { role: 'assistant', content: 'Алдаа гарлаа. Дахин оролдоно уу.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div style={{
          position: 'fixed', bottom: 88, right: 24, zIndex: 1000,
          width: 340, display: 'flex', flexDirection: 'column',
          background: '#fff', borderRadius: 20,
          boxShadow: '0 12px 48px rgba(0,67,77,0.22)',
          border: '1px solid #d0eaed', overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#00434D 0%,#0097A9 100%)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <DiamondIcon size={26} />
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: '0.04em' }}>Luna AI</div>
              <div style={{ color: '#a8e6ed', fontSize: 11 }}>Үнэт эдлэлийн мэргэжилтэн</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
          </div>

          {/* Mode + Clear */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f4fbfc', borderBottom: '1px solid #d0eaed' }}>
            <select
              value={mode}
              onChange={e => setMode(e.target.value)}
              style={{
                flex: 1, border: '1.5px solid #0097A9', borderRadius: 8,
                padding: '5px 10px', fontSize: 12, fontWeight: 600,
                color: '#00434D', background: '#fff', cursor: 'pointer', outline: 'none',
              }}
            >
              {MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
            {msgs.length > 0 && (
              <button onClick={clearHistory} style={{
                padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                border: '1.5px solid #d0eaed', background: '#fff', color: '#666',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}>Цэвэрлэх</button>
            )}
          </div>

          {/* Messages */}
          <div style={{ overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 220, maxHeight: 360 }}>
            {msgs.length === 0 && (
              <div style={{ textAlign: 'center', color: '#0097A9', padding: '20px 0' }}>
                <DiamondIcon size={44} />
                <p style={{ marginTop: 12, fontWeight: 700, fontSize: 14, color: '#00434D' }}>Сайн байна уу!</p>
                <p style={{ fontSize: 12, color: '#666', marginTop: 4, lineHeight: 1.6 }}>Үнэт эдлэл, үнэ, арчилгаа<br/>талаар асуугаарай</p>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: m.products?.length ? 8 : 0 }}>
                  {m.role === 'assistant' && (
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#00434D,#0097A9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 6, marginTop: 2 }}>
                      <DiamondIcon size={14} />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '78%', padding: '9px 13px',
                    borderRadius: m.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    background: m.role === 'user' ? '#00434D' : '#f0fafc',
                    color: m.role === 'user' ? '#fff' : '#0d0d0d',
                    fontSize: 13, lineHeight: 1.65,
                    border: m.role === 'assistant' ? '1px solid #d0eaed' : 'none',
                  }}>
                    {m.content}
                  </div>
                </div>
                {m.products?.length > 0 && (
                  <div style={{ paddingLeft: 30 }}>
                    <ProductCarousel products={m.products} />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#00434D,#0097A9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DiamondIcon size={14} />
                </div>
                <div style={{ padding: '10px 14px', borderRadius: '4px 16px 16px 16px', background: '#f0fafc', border: '1px solid #d0eaed', display: 'flex', gap: 5 }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#0097A9', display: 'block', animation: `dot ${0.8+i*0.15}s ease-in-out infinite alternate` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <form onSubmit={send} style={{ display: 'flex', padding: '10px 12px', borderTop: '1px solid #d0eaed', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder='Асуулт бичнэ үү...'
              disabled={loading}
              style={{ flex: 1, border: '1.5px solid #d0eaed', borderRadius: 10, padding: '9px 13px', fontSize: 13, outline: 'none', color: '#0d0d0d', fontFamily: 'inherit' }}
              onFocus={e => e.target.style.borderColor = '#0097A9'}
              onBlur={e => e.target.style.borderColor = '#d0eaed'}
            />
            <button type='submit' disabled={loading || !input.trim()} style={{
              background: 'linear-gradient(135deg,#00434D,#0097A9)', color: '#fff',
              border: 'none', borderRadius: 10, width: 38, cursor: 'pointer', fontSize: 17,
              opacity: loading || !input.trim() ? 0.4 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>→</button>
          </form>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        title='Luna AI туслах'
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 58, height: 58, borderRadius: '50%',
          background: 'linear-gradient(135deg,#00434D 0%,#0097A9 100%)',
          border: '2px solid rgba(255,255,255,0.2)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(0,67,77,0.4)',
          transition: 'transform .2s, box-shadow .2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,67,77,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,67,77,0.4)'; }}
      >
        {open ? <span style={{ color: '#fff', fontSize: 24, fontWeight: 300 }}>×</span> : <DiamondIcon size={32} />}
      </button>

      <style>{`
        @keyframes dot { from{transform:translateY(0);opacity:.5} to{transform:translateY(-4px);opacity:1} }
      `}</style>
    </>
  );
}
