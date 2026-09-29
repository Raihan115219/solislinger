'use client';

import { useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletReadyState, type WalletError } from '@solana/wallet-adapter-base';
import { PhantomWalletName } from '@solana/wallet-adapter-phantom';
import { showNotice } from '@/lib/noticeStore';

// Silent reconnects on page load can fail harmlessly; only surface errors for attempts the user started.
let userAttempt = false;

export function reportWalletError(error: WalletError) {
  if (process.env.NODE_ENV !== 'production') console.warn('[wallet]', error.name, error.message);
  if (!userAttempt) return;
  userAttempt = false;
  const text = `${error.name} ${error.message}`;
  if (error.name === 'WalletNotReadyError') showNotice('Phantom wallet not detected.', 'error');
  else if (/reject|denied|declin|cancel|closed/i.test(text)) showNotice('Connection request declined in Phantom.', 'error');
  else showNotice('Couldn’t connect to Phantom. Please try again.', 'error');
}

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

function openPhantomInstall() {
  if (isMobile()) {
    // Opens this page inside Phantom's in-app browser, where the wallet is available.
    const url = encodeURIComponent(window.location.href);
    const ref = encodeURIComponent(window.location.origin);
    window.location.href = `https://phantom.app/ul/browse/${url}?ref=${ref}`;
    return;
  }
  window.open('https://phantom.com/download', '_blank', 'noopener,noreferrer');
  showNotice('Phantom not detected. Install the extension, then refresh this page.', 'info');
}

export const truncateAddress = (address: string) => `${address.slice(0, 4)}…${address.slice(-4)}`;

export function usePhantom() {
  const { wallets, wallet, select, connect, disconnect, connected, connecting, publicKey } = useWallet();
  const phantom = wallets.find((w) => w.adapter.name === PhantomWalletName);
  const available =
    phantom?.readyState === WalletReadyState.Installed || phantom?.readyState === WalletReadyState.Loadable;

  useEffect(() => {
    if (connected && userAttempt) {
      userAttempt = false;
      showNotice('Wallet connected · Solana Devnet');
    }
  }, [connected]);

  const requestConnect = useCallback(async () => {
    if (!available) {
      openPhantomInstall();
      return;
    }
    userAttempt = true;
    if (wallet?.adapter.name !== PhantomWalletName) {
      select(PhantomWalletName);
      return;
    }
    try {
      await connect();
    } catch {
      // Already reported through the provider's onError.
    }
  }, [available, wallet, select, connect]);

  const requestDisconnect = useCallback(async () => {
    try {
      await disconnect();
    } catch {
      // Reported through onError; the adapter resets its state regardless.
    }
  }, [disconnect]);

  return {
    address: publicKey?.toBase58() ?? null,
    connected,
    connecting,
    requestConnect,
    requestDisconnect,
  };
}
