import { ethers } from 'ethers';

// ─── INLINE ABI ──────────────────────────────────────────────────────────────
// Inlined so the app works without compiled Hardhat artifacts.
// After `npx hardhat compile`, the JSON artifact will be generated.
export const PACT_ABI = [
  // State
  'function pactCount() external view returns (uint256)',
  'function commitmentScore(address) external view returns (uint256)',

  // Write
  'function createPact(address token, uint8 ruleType, bytes ruleParams, string name, string message, uint8 guardianThreshold) external returns (uint256)',
  'function deposit(uint256 pactId) external payable',
  'function depositERC20(uint256 pactId, uint256 amount) external',
  'function assignGuardians(uint256 pactId, address[] guardians) external',
  'function updateGuardians(uint256 pactId, address[] newGuardians) external',
  'function requestRelease(uint256 pactId) external',
  'function approveRelease(uint256 pactId) external',
  'function release(uint256 pactId) external',
  'function cancelPact(uint256 pactId) external',

  // Read
  'function getPact(uint256 pactId) external view returns (tuple(address owner, address token, uint256 amount, uint8 ruleType, bytes ruleParams, string name, string message, uint256 createdAt, uint256 releaseRequestedAt, uint8 guardianThreshold, uint8 guardianApprovalCount, uint8 status))',
  'function getUserPacts(address user) external view returns (uint256[])',
  'function getGuardians(uint256 pactId) external view returns (address[])',
  'function hasGuardianApproved(uint256 pactId, address guardian) external view returns (bool)',
  'function calculateCommitmentScore(address user) external view returns (uint256)',

  // Events
  'event PactCreated(uint256 indexed pactId, address indexed owner, address token, uint8 ruleType)',
  'event DepositMade(uint256 indexed pactId, address token, uint256 amount)',
  'event GuardianAssigned(uint256 indexed pactId, address indexed guardian)',
  'event GuardianApproved(uint256 indexed pactId, address indexed guardian)',
  'event ReleaseRequested(uint256 indexed pactId, address indexed requester, uint256 timestamp)',
  'event ReleaseApproved(uint256 indexed pactId, address indexed guardian)',
  'event PactReleased(uint256 indexed pactId, address indexed to, uint256 amount)',
  'event PactBroken(uint256 indexed pactId)',
  'event CommitmentCompleted(uint256 indexed pactId, address indexed owner, uint256 newScore)',
] as const;

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PACT_ADDRESS || '';

// ─── PROVIDER HELPERS ─────────────────────────────────────────────────────────

export function getBrowserProvider(): ethers.BrowserProvider | null {
  // Detect various injected providers (MetaMask, WalletConnect, etc.)
  if (typeof window === 'undefined') return null;
  const eth = (window as any).ethereum || (window as any).web3?.currentProvider;
  if (!eth) return null;
  return new ethers.BrowserProvider(eth);
}

export function getJsonRpcProvider(): ethers.JsonRpcProvider {
  const rpc = process.env.NEXT_PUBLIC_NETWORK_RPC || 'http://127.0.0.1:8545';
  return new ethers.JsonRpcProvider(rpc);
}

export async function getSignerAndContract() {
  if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) {
    throw new Error('Pact contract address is invalid or not configured. Please check your NEXT_PUBLIC_PACT_ADDRESS environment variable.');
  }
  const provider = getBrowserProvider();
  if (!provider) throw new Error('No wallet detected. Please connect a wallet.');
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, PACT_ABI, signer);
  return { signer, contract, provider };
}

export function getReadContract(): ethers.Contract {
  if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) {
    throw new Error('Pact contract address is invalid or not configured. Please check your NEXT_PUBLIC_PACT_ADDRESS environment variable.');
  }
  const provider = getBrowserProvider() || getJsonRpcProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, PACT_ABI, provider);
}

// ─── RULE ENCODING ────────────────────────────────────────────────────────────
// Helpers to ABI-encode rule parameters for createPact()

const coder = ethers.AbiCoder.defaultAbiCoder();

export function encodeTimeLockParams(unlockTimestamp: number): string {
  return coder.encode(['uint256'], [unlockTimestamp]);
}

export function encodeCooldownParams(cooldownSeconds: number): string {
  return coder.encode(['uint256'], [cooldownSeconds]);
}

export function encodeSavingsGoalParams(targetWei: bigint): string {
  return coder.encode(['uint256'], [targetWei]);
}

export function encodeEmptyParams(): string {
  return coder.encode(['uint256'], [0]);
}

// ─── DECODING ─────────────────────────────────────────────────────────────────

export function decodeTimeLockParams(params: string): number {
  try {
    const [ts] = coder.decode(['uint256'], params);
    return Number(ts);
  } catch { return 0; }
}

export function decodeCooldownParams(params: string): number {
  try {
    const [secs] = coder.decode(['uint256'], params);
    return Number(secs);
  } catch { return 0; }
}

export function decodeSavingsGoalParams(params: string): bigint {
  try {
    const [goal] = coder.decode(['uint256'], params);
    return goal as bigint;
  } catch { return 0n; }
}
