// ─── ENUMS ────────────────────────────────────────────────────────────────────

export type RuleType =
  | 'TimeLock'
  | 'Cooldown'
  | 'FriendApproval'
  | 'TrustedGuardians'
  | 'SavingsGoal';

export const RULE_TYPE_INDEX: Record<RuleType, number> = {
  TimeLock: 0,
  Cooldown: 1,
  FriendApproval: 2,
  TrustedGuardians: 3,
  SavingsGoal: 4,
};

export const RULE_TYPE_FROM_INDEX: Record<number, RuleType> = {
  0: 'TimeLock',
  1: 'Cooldown',
  2: 'FriendApproval',
  3: 'TrustedGuardians',
  4: 'SavingsGoal',
};

export type PactStatus = 'Active' | 'Fulfilled' | 'Broken' | 'Canceled';

export const PACT_STATUS_FROM_INDEX: Record<number, PactStatus> = {
  0: 'Active',
  1: 'Fulfilled',
  2: 'Broken',
  3: 'Canceled',
};

// ─── TOKEN ────────────────────────────────────────────────────────────────────

export interface Token {
  symbol: string;
  name: string;
  address: string; // '0x0000000000000000000000000000000000000000' for native
  decimals: number;
  logo: string;    // emoji or URL
  isNative: boolean;
  coingeckoId?: string;
}

// ─── RULE CONFIG ──────────────────────────────────────────────────────────────

export interface RuleConfig {
  type: RuleType;
  // TimeLock
  unlockTimestamp?: number;  // unix timestamp
  unlockDate?: string;       // ISO string for display
  // Cooldown
  cooldownSeconds?: number;
  cooldownDays?: number;
  // SavingsGoal
  targetAmount?: string;
  // Guardians (FriendApproval + TrustedGuardians)
  guardians?: string[];
  threshold?: number;
}

// ─── PACT ─────────────────────────────────────────────────────────────────────

/** Raw data from the smart contract (BigInt amounts) */
export interface RawPactData {
  owner: string;
  token: string;
  amount: bigint;
  ruleType: number;
  ruleParams: string;
  name: string;
  message: string;
  createdAt: bigint;
  releaseRequestedAt: bigint;
  guardianThreshold: number;
  guardianApprovalCount: number;
  status: number;
}

/** Enriched pact for the UI */
export interface PactData {
  id: string;
  owner: string;
  token: string;
  tokenSymbol: string;
  tokenDecimals: number;
  amount: bigint;
  amountFormatted: string;
  ruleType: RuleType;
  ruleParams: string;
  name: string;
  message: string;
  createdAt: number;
  releaseRequestedAt: number;
  guardianThreshold: number;
  guardianApprovalCount: number;
  status: PactStatus;
  // Derived
  guardians?: string[];
  unlockTimestamp?: number;
  cooldownSeconds?: number;
  targetAmount?: bigint;
}

// ─── WIZARD ───────────────────────────────────────────────────────────────────

export interface WizardState {
  name: string;
  token: Token | null;
  amount: string;
  rule: RuleConfig;
  futureMessage: string;
  whyCommitting: string;
  consequence: string;
}

// ─── ACTIVITY ─────────────────────────────────────────────────────────────────

export type ActivityEventType =
  | 'PactCreated'
  | 'DepositMade'
  | 'GuardianAssigned'
  | 'GuardianApproved'
  | 'ReleaseRequested'
  | 'ReleaseApproved'
  | 'PactReleased'
  | 'PactBroken'
  | 'CommitmentCompleted';

export interface ActivityEvent {
  type: ActivityEventType;
  pactId: string;
  pactName?: string;
  timestamp: number;
  txHash?: string;
  actor?: string;
  amount?: bigint;
  tokenSymbol?: string;
}

// ─── COMMITMENT SCORE ─────────────────────────────────────────────────────────

export interface CommitmentScore {
  score: number;
  completionRate: number;
  longestStreak: number;
  activePacts: number;
  completedPacts: number;
  brokenPacts: number;
  totalLocked: string;
  lifetimePacts: number;
}

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'commitment' | 'guardian' | 'streak' | 'milestone';
  earned: boolean;
  earnedAt?: number;
  progress?: number;    // 0–100 for in-progress
  requirement?: number;
}

// ─── WALLET ───────────────────────────────────────────────────────────────────

export interface WalletState {
  address: string | null;
  chainId: number | null;
  status: 'disconnected' | 'connecting' | 'connected' | 'wrong-network';
  balance: string | null;
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
