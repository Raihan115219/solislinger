'use client';

import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { useStore } from '@/lib/createStore';
import { exploredStore } from '@/lib/hotspotStore';
import { noticeStore } from '@/lib/noticeStore';
import { usePhantom } from '@/components/wallet/usePhantom';
import { WalletControl } from '@/components/wallet/WalletControl';

export function Hud() {
  return (
    <header className="hud">
      <div className="brand">
        <span className="brand__name">Solslinger</span>
        <span className="brand__sub">The Bloody Raven</span>
      </div>
      <WalletControl />
    </header>
  );
}

export function Toast() {
  const notice = useStore(noticeStore, null);
  return (
    <div className="toast-slot" role="status" aria-live="polite">
      {notice && (
        <p key={notice.id} className={`toast toast--${notice.tone}`}>
          {notice.text}
        </p>
      )}
    </div>
  );
}

function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: none)');
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return coarse;
}

export function WelcomePlaque({ ready }: { ready: boolean }) {
  const { connected, connecting, requestConnect } = usePhantom();
  const [dismissed, setDismissed] = useState(false);
  const explored = useStore(exploredStore, false);
  const touch = useCoarsePointer();
  const showPlaque = ready && !connected && !dismissed;
  const showHint = ready && !showPlaque && !explored;

  return (
    <>
      <section className={`plaque${showPlaque ? ' is-visible' : ''}`} aria-hidden={!showPlaque}>
        <p className="plaque__eyebrow">Welcome, stranger</p>
        <h1 className="plaque__title">The Bloody Raven</h1>
        <p className="plaque__body">Connect your Phantom wallet to step up to the bar.</p>
        <button
          type="button"
          className="btn btn--gold"
          onClick={requestConnect}
          disabled={connecting}
          tabIndex={showPlaque ? 0 : -1}
        >
          {connecting ? 'Connecting…' : 'Connect Wallet'}
        </button>
        <button
          type="button"
          className="plaque__skip"
          onClick={() => setDismissed(true)}
          tabIndex={showPlaque ? 0 : -1}
        >
          Just looking around
        </button>
      </section>
      <p className={`hint${showHint ? ' is-visible' : ''}`} aria-hidden={!showHint}>
        {touch ? 'Tap' : 'Hover'} around the saloon to explore
      </p>
    </>
  );
}

export function LoadingScreen({ done }: { done: boolean }) {
  const { progress } = useProgress();
  return (
    <div className={`loader${done ? ' is-done' : ''}`} aria-hidden={done} role="status">
      <div className="loader__brand">Solslinger</div>
      <p className="loader__text">Entering the Bloody Raven…</p>
      <div className="loader__bar">
        <span style={{ transform: `scaleX(${Math.max(0.04, progress / 100)})` }} />
      </div>
    </div>
  );
}

export function ErrorPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="error-panel" role="alert">
      <div className="error-panel__card">
        <p className="plaque__eyebrow">Solslinger</p>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
    </div>
  );
}
