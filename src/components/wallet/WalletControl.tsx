'use client';

import { useEffect, useRef, useState } from 'react';
import { truncateAddress, usePhantom } from './usePhantom';

export function WalletControl() {
  const { address, connected, connecting, requestConnect, requestDisconnect } = usePhantom();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!connected) setOpen(false);
  }, [connected]);

  if (!connected || !address) {
    return (
      <button type="button" className="btn btn--gold btn--sm" onClick={requestConnect} disabled={connecting}>
        {connecting ? 'Connecting…' : 'Connect Wallet'}
      </button>
    );
  }

  return (
    <div className="wallet" ref={root}>
      <button
        type="button"
        className="wallet__pill"
        aria-haspopup="menu"
        aria-expanded={open}
        title={address}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="wallet__dot" aria-hidden />
        <span className="wallet__addr">{truncateAddress(address)}</span>
        <svg className="wallet__chev" viewBox="0 0 10 6" aria-hidden>
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <div className="wallet__menu" role="menu">
          <div className="wallet__meta">
            <span>Phantom</span>
            <span className="wallet__net">Devnet</span>
          </div>
          <button
            type="button"
            role="menuitem"
            className="wallet__item"
            onClick={() => {
              setOpen(false);
              void requestDisconnect();
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
