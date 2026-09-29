'use client';

import { useCallback, useMemo, type ReactNode } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import type { WalletError } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import { reportWalletError } from './usePhantom';

const DEVNET_ENDPOINT = clusterApiUrl('devnet');

export function SolanaProvider({ children }: { children: ReactNode }) {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  const onError = useCallback((error: WalletError) => reportWalletError(error), []);
  return (
    <ConnectionProvider endpoint={DEVNET_ENDPOINT}>
      {/* autoConnect: selecting Phantom connects immediately, and returning visitors reconnect silently. */}
      <WalletProvider wallets={wallets} autoConnect onError={onError}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
