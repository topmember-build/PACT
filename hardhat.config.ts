import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Parse .env.local manually — last value wins for duplicate keys
function loadEnvLocal(): Record<string, string> {
  try {
    const raw = readFileSync(resolve(__dirname, '.env.local'), 'utf-8');
    const vars: Record<string, string> = {};
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      // Keep raw value — do NOT strip quotes
      const val = trimmed.slice(eq + 1);
      if (val) vars[key] = val;
    }
    return vars;
  } catch {
    return {};
  }
}

const env = loadEnvLocal();

// Support both env var and .env.local — explicit env var wins
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY || env.DEPLOYER_PRIVATE_KEY || '';
const MONAD_RPC = process.env.MONAD_TESTNET_RPC || env.MONAD_TESTNET_RPC || 'https://testnet-rpc.monad.xyz';

// Hardhat requires exactly 32-byte hex private keys (0x + 64 hex chars)
function validKey(k: string): string[] {
  const clean = k.startsWith('0x') ? k : `0x${k}`;
  return clean.length === 66 ? [clean] : [];
}

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {},
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
    },
    monadTestnet: {
      url: MONAD_RPC,
      chainId: 10143,
      accounts: validKey(DEPLOYER_KEY),
    },
  },
  paths: {
    sources: './contracts',
    tests:   './test',
    cache:   './cache',
    artifacts: './artifacts',
  },
};

export default config;
