import type { Token } from './types';

export const NATIVE_ADDRESS = '0x0000000000000000000000000000000000000000';

export const SUPPORTED_TOKENS: Token[] = [
  {
    symbol: 'MON',
    name: 'Monad',
    address: NATIVE_ADDRESS,
    decimals: 18,
    logo: '/tokens/mon.svg',
    isNative: true,
    coingeckoId: 'monad',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    // Replace with actual Monad Testnet USDC address once deployed
    address: '0x0000000000000000000000000000000000000001',
    decimals: 6,
    logo: '/tokens/usdc.svg',
    isNative: false,
    coingeckoId: 'usd-coin',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    // Replace with actual Monad Testnet USDT address once deployed
    address: '0x0000000000000000000000000000000000000002',
    decimals: 6,
    logo: '/tokens/usdt.svg',
    isNative: false,
    coingeckoId: 'tether',
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    // Replace with actual Monad Testnet WETH address once deployed
    address: '0x0000000000000000000000000000000000000003',
    decimals: 18,
    logo: '/tokens/weth.svg',
    isNative: false,
    coingeckoId: 'weth',
  },
];

export function getTokenByAddress(address: string): Token | undefined {
  return SUPPORTED_TOKENS.find(
    (t) => t.address.toLowerCase() === address.toLowerCase()
  );
}

export function getTokenBySymbol(symbol: string): Token | undefined {
  return SUPPORTED_TOKENS.find(
    (t) => t.symbol.toLowerCase() === symbol.toLowerCase()
  );
}

export function getNativeToken(): Token {
  return SUPPORTED_TOKENS[0];
}
