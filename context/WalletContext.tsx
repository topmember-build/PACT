'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useAppKit, useAppKitAccount, useAppKitNetwork, useDisconnect } from '@reown/appkit/react';
import { useBalance } from 'wagmi';
import type { WalletState } from '../lib/types';
import { monadTestnet, localHardhat } from '../lib/reown';

const EXPECTED_CHAIN_ID = Number(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID || 31337);
const ALLOWED_CHAIN_IDS: number[] = [monadTestnet.id, localHardhat.id];

// ─── CONTEXT TYPES ────────────────────────────────────────────────────────────

interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

// ─── PROVIDER ─────────────────────────────────────────────────────────────────

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { open } = useAppKit();
  const { disconnect: appKitDisconnect } = useDisconnect();
  const { address, isConnected, status: appKitStatus } = useAppKitAccount();
  const { chainId, switchNetwork: appKitSwitchNetwork } = useAppKitNetwork();

  // Derive our wallet status from AppKit state
  const deriveStatus = (): WalletState['status'] => {
    if (appKitStatus === 'connecting' || appKitStatus === 'reconnecting') return 'connecting';
    if (!isConnected || !address) return 'disconnected';
    if (chainId && !ALLOWED_CHAIN_IDS.includes(Number(chainId))) return 'wrong-network';
    return 'connected';
  };

  const walletStatus = deriveStatus();

  // Fetch native MON balance when connected
  const { data: balanceData } = useBalance({
    address: (isConnected && address) ? address as `0x${string}` : undefined,
  });

  const balanceFormatted = balanceData
    ? (Number(balanceData.value) / 10 ** balanceData.decimals).toFixed(4)
    : null;

  // ── Actions ──────────────────────────────────────────────────────────────────

  const connect = useCallback(async () => {
    await open({ view: 'Connect' });
  }, [open]);

  const disconnect = useCallback(() => {
    appKitDisconnect();
  }, [appKitDisconnect]);

  const switchNetwork = useCallback(async () => {
    try {
      await appKitSwitchNetwork(monadTestnet);
    } catch {
      // If the SDK switch fails, fall back to opening the network selector
      await open({ view: 'Networks' });
    }
  }, [appKitSwitchNetwork, open]);

  // ── Assemble state ───────────────────────────────────────────────────────────

  const value: WalletContextValue = {
    address: (isConnected && address) ? address : null,
    chainId: chainId ? Number(chainId) : null,
    status: walletStatus,
    balance: balanceFormatted,
    connect,
    disconnect,
    switchNetwork,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
