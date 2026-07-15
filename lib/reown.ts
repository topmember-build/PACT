import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from 'viem';
import { mainnet } from '@reown/appkit/networks';

// ─── PROJECT ID ───────────────────────────────────────────────────────────────
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;
if (!projectId) throw new Error('NEXT_PUBLIC_REOWN_PROJECT_ID is not set');

// ─── CHAINS ───────────────────────────────────────────────────────────────────

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_NETWORK_RPC || 'https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
});

export const localHardhat = defineChain({
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
  testnet: true,
});

// Export the networks array used for AppKit initialization
export const networks: [typeof monadTestnet, typeof localHardhat, typeof mainnet] = [monadTestnet, localHardhat, mainnet];

// ─── WAGMI ADAPTER ────────────────────────────────────────────────────────────
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
