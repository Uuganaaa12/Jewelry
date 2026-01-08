'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { io } from 'socket.io-client';
import { API_BASE, resolveToken } from '../_store/http';

let sharedAudioCtx = null;

const ensureAudioContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }

  if (sharedAudioCtx.state === 'suspended') {
    const unlock = () => {
      sharedAudioCtx?.resume().catch(() => {});
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  return sharedAudioCtx;
};

const playChime = () => {
  try {
    const ctx = ensureAudioContext();
    if (!ctx || ctx.state === 'suspended') return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = 880;

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1);
  } catch (error) {
    console.warn('Notification sound skipped', error?.message || error);
  }
};

export default function AdminOrderNotifications() {
  const [notifications, setNotifications] = useState([]);
  const timersRef = useRef([]);

  useEffect(() => {
    const token = resolveToken();
    if (!token) return undefined;

    const socketUrl = (API_BASE || 'http://localhost:5001').replace(/\/$/, '');
    const socket = io(socketUrl, {
      autoConnect: false,
      reconnectionAttempts: 3,
      reconnectionDelay: 500,
      auth: { token },
    });

    const handleNewOrder = payload => {
      const notification = {
        id: `${payload?.id || 'order'}-${Date.now()}`,
        orderId: payload?.id,
        customer: payload?.customer || 'Customer',
        total: Number(payload?.total) || 0,
        payment: payload?.payment || 'unknown',
        createdAt: payload?.createdAt || new Date().toISOString(),
      };

      setNotifications(prev => [notification, ...prev].slice(0, 3));
      playChime();

      const timeoutId = window.setTimeout(() => {
        setNotifications(prev => prev.filter(item => item.id !== notification.id));
      }, 8000);

      timersRef.current.push(timeoutId);
    };

    socket.on('order:new', handleNewOrder);
    socket.on('connect_error', error => {
      console.warn('Socket connection failed', error?.message || error);
    });

    socket.connect();

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.disconnect();
      timersRef.current.forEach(id => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const dismiss = id => {
    setNotifications(prev => prev.filter(item => item.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className='fixed right-6 top-24 z-50 flex flex-col gap-3'>
      {notifications.map(item => (
        <div
          key={item.id}
          className='w-80 border border-[#0d0d0d] bg-[#ffffff] px-4 py-3 shadow-[0_10px_28px_rgba(0,0,0,0.12)]'>
          <div className='flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-[#4d5544]'>
            <span className='flex items-center gap-2'>
              <Bell size={16} />
              New order
            </span>
            <button
              type='button'
              aria-label='Dismiss notification'
              onClick={() => dismiss(item.id)}
              className='text-[#0d0d0d] transition-colors hover:text-[#4d5544]'>
              <X size={14} />
            </button>
          </div>

          <div className='mt-3 flex flex-col gap-1 text-xs uppercase tracking-[0.18em] text-[#0d0d0d]'>
            <span className='text-sm font-semibold tracking-[0.14em]'>
              {item.total.toFixed(0)}₮
            </span>
            <span className='text-[11px] text-[#4d5544]'>
              {item.payment}
            </span>
            <span className='text-[11px] text-[#0d0d0d]'>
              {item.customer}
            </span>
            {item.orderId && (
              <Link
                href={`/admin/orders/${item.orderId}`}
                className='mt-2 inline-flex w-fit border border-[#0d0d0d] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-[#0d0d0d] hover:text-[#ffffff]'>
                View order
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
