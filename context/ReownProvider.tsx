'use client';

import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { wagmiAdapter, wagmiConfig, projectId, networks, monadTestnet } from '../lib/reown';

// ─── QUERY CLIENT ─────────────────────────────────────────────────────────────
const queryClient = new QueryClient();

// ─── APPKIT INIT (runs once on import) ────────────────────────────────────────
// Guard against double-init in Next.js dev (React Strict Mode double-renders)
let appKitInitialized = false;

if (typeof window !== 'undefined' && !appKitInitialized) {
  appKitInitialized = true;
  createAppKit({
    adapters: [wagmiAdapter],
    projectId: projectId!,
    networks,
    defaultNetwork: monadTestnet,
    metadata: {
      name: 'Pact',
      description: 'Make promises your future self can\'t break.',
      url: window.location.origin,
      icons: ['/assets/pact-logo.jpg'],
    },
    features: {
      analytics: false,
      socials: false,
      email: false,
    },
    enableEIP6963: true,   // detect all injected wallets (MetaMask, Rabby, etc.)
    enableCoinbase: true,
    themeMode: 'dark',
    themeVariables: {
      '--w3m-accent': '#7c3aed',
      '--w3m-border-radius-master': '12px',
    },
  });
}

// ─── PROVIDER ─────────────────────────────────────────────────────────────────
export function ReownProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
