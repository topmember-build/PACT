import { ethers } from 'ethers';
import type {
  RuleType,
  PactData,
  RawPactData,
  PactStatus,
  CommitmentScore,
  Achievement,
  RuleConfig,
} from './types';
import {
  RULE_TYPE_FROM_INDEX,
  PACT_STATUS_FROM_INDEX,
} from './types';
import { getTokenByAddress } from './tokens';
import {
  decodeTimeLockParams,
  decodeCooldownParams,
  decodeSavingsGoalParams,
} from './contract';

// ─── FORMATTING ───────────────────────────────────────────────────────────────

export function formatAmount(amount: bigint, decimals: number): string {
  const str = ethers.formatUnits(amount, decimals);
  const num = parseFloat(str);
  if (num === 0) return '0';
  if (num < 0.0001) return '< 0.0001';
  if (num < 1) return num.toFixed(4);
  if (num < 1000) return num.toFixed(3);
  if (num < 1_000_000) return `${(num / 1000).toFixed(2)}K`;
  return `${(num / 1_000_000).toFixed(2)}M`;
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatTimestamp(ts: number): string {
  if (!ts) return '-';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(ts * 1000));
}

export function formatDate(ts: number): string {
  if (!ts) return '-';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(ts * 1000));
}

export function formatRelativeTime(ts: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = ts - now;
  const absDiff = Math.abs(diff);
  const isPast = diff < 0;

  const s = absDiff;
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);

  let label: string;
  if (d > 365) label = `${Math.floor(d / 365)}y`;
  else if (d > 30) label = `${Math.floor(d / 30)}mo`;
  else if (d > 0) label = `${d}d`;
  else if (h > 0) label = `${h}h ${m % 60}m`;
  else if (m > 0) label = `${m}m`;
  else label = `${s}s`;

  return isPast ? `${label} ago` : `in ${label}`;
}

export function formatCountdown(ts: number): {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  label: string;
} {
  const now = Math.floor(Date.now() / 1000);
  const diff = ts - now;
  if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0, label: 'Unlocked' };

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  let label = '';
  if (days > 0) label = `${days}d ${hours}h ${minutes}m`;
  else if (hours > 0) label = `${hours}h ${minutes}m ${seconds}s`;
  else label = `${minutes}m ${seconds}s`;

  return { expired: false, days, hours, minutes, seconds, label };
}

// ─── PACT ENRICHMENT ──────────────────────────────────────────────────────────

export function enrichPact(id: string, raw: RawPactData): PactData {
  const ruleType = RULE_TYPE_FROM_INDEX[raw.ruleType] ?? 'TimeLock';
  const status = PACT_STATUS_FROM_INDEX[raw.status] ?? 'Active';
  const token = getTokenByAddress(raw.token);

  let unlockTimestamp: number | undefined;
  let cooldownSeconds: number | undefined;
  let targetAmount: bigint | undefined;

  if (ruleType === 'TimeLock') unlockTimestamp = decodeTimeLockParams(raw.ruleParams);
  else if (ruleType === 'Cooldown') cooldownSeconds = decodeCooldownParams(raw.ruleParams);
  else if (ruleType === 'SavingsGoal') targetAmount = decodeSavingsGoalParams(raw.ruleParams);

  return {
    id,
    owner: raw.owner,
    token: raw.token,
    tokenSymbol: token?.symbol ?? 'UNKNOWN',
    tokenDecimals: token?.decimals ?? 18,
    amount: raw.amount,
    amountFormatted: formatAmount(raw.amount, token?.decimals ?? 18),
    ruleType,
    ruleParams: raw.ruleParams,
    name: raw.name,
    message: raw.message,
    createdAt: Number(raw.createdAt),
    releaseRequestedAt: Number(raw.releaseRequestedAt),
    guardianThreshold: raw.guardianThreshold,
    guardianApprovalCount: raw.guardianApprovalCount,
    status,
    unlockTimestamp,
    cooldownSeconds,
    targetAmount,
  };
}

// ─── RULE VALIDATION (FRONTEND) ───────────────────────────────────────────────

export interface ReleaseValidation {
  canRelease: boolean;
  canRequest: boolean;
  reason: string;
  detail?: string;
}

export function validateRelease(pact: PactData): ReleaseValidation {
  const now = Math.floor(Date.now() / 1000);

  if (pact.status !== 'Active') {
    return { canRelease: false, canRequest: false, reason: `Pact is ${pact.status.toLowerCase()}.` };
  }
  if (pact.amount === 0n) {
    return { canRelease: false, canRequest: false, reason: 'No funds are locked in this pact.' };
  }

  switch (pact.ruleType) {
    case 'TimeLock': {
      const unlock = pact.unlockTimestamp ?? 0;
      if (now < unlock) {
        const countdown = formatCountdown(unlock);
        return {
          canRelease: false,
          canRequest: false,
          reason: 'Time lock has not expired.',
          detail: `Your funds are locked for another ${countdown.label}. This is the commitment you made to yourself.`,
        };
      }
      return { canRelease: true, canRequest: false, reason: 'Time lock has expired. You may release.' };
    }

    case 'Cooldown': {
      const cd = pact.cooldownSeconds ?? 0;
      if (!pact.releaseRequestedAt) {
        return {
          canRelease: false,
          canRequest: true,
          reason: 'You must first request release and wait the cooldown period.',
          detail: `Once requested, you must wait ${Math.floor(cd / 86400)} days before releasing.`,
        };
      }
      const unlockAt = pact.releaseRequestedAt + cd;
      if (now < unlockAt) {
        const countdown = formatCountdown(unlockAt);
        return {
          canRelease: false,
          canRequest: false,
          reason: 'Cooldown period is still active.',
          detail: `Release available ${countdown.label}. This delay protects you from impulsive decisions.`,
        };
      }
      return { canRelease: true, canRequest: false, reason: 'Cooldown complete. You may release.' };
    }

    case 'FriendApproval':
    case 'TrustedGuardians': {
      if (!pact.releaseRequestedAt) {
        return {
          canRelease: false,
          canRequest: true,
          reason: 'Request release to notify your guardians.',
          detail: `${pact.guardianThreshold} guardian${pact.guardianThreshold > 1 ? 's' : ''} must approve before funds are released.`,
        };
      }
      if (pact.guardianApprovalCount < pact.guardianThreshold) {
        const remaining = pact.guardianThreshold - pact.guardianApprovalCount;
        return {
          canRelease: false,
          canRequest: false,
          reason: `Waiting for guardian approvals (${pact.guardianApprovalCount}/${pact.guardianThreshold}).`,
          detail: `${remaining} more approval${remaining > 1 ? 's' : ''} needed. Your guardians are your accountability partners.`,
        };
      }
      return { canRelease: true, canRequest: false, reason: 'All guardian approvals received.' };
    }

    case 'SavingsGoal': {
      const goal = pact.targetAmount ?? 0n;
      if (pact.amount < goal) {
        const tokenSymbol = pact.tokenSymbol;
        const needed = formatAmount(goal - pact.amount, pact.tokenDecimals);
        return {
          canRelease: false,
          canRequest: false,
          reason: 'Savings goal not yet reached.',
          detail: `You need ${needed} more ${tokenSymbol} to reach your goal.`,
        };
      }
      return { canRelease: true, canRequest: false, reason: 'Savings goal reached!' };
    }

    default:
      return { canRelease: false, canRequest: false, reason: 'Unknown rule type.' };
  }
}

// ─── COMMITMENT SCORE ─────────────────────────────────────────────────────────

export function computeCommitmentScore(pacts: PactData[]): CommitmentScore {
  const active = pacts.filter(p => p.status === 'Active').length;
  const completed = pacts.filter(p => p.status === 'Fulfilled').length;
  const broken = pacts.filter(p => p.status === 'Broken').length;
  const total = pacts.length;
  const score = completed * 10;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const totalLocked = pacts
    .filter(p => p.status === 'Active')
    .reduce((acc, p) => acc + p.amount, 0n);

  // Streak: consecutive completed pacts ordered by creation
  let streak = 0;
  const sorted = [...pacts].sort((a, b) => b.createdAt - a.createdAt);
  for (const p of sorted) {
    if (p.status === 'Fulfilled') streak++;
    else if (p.status === 'Broken') break;
  }

  return {
    score,
    completionRate,
    longestStreak: streak,
    activePacts: active,
    completedPacts: completed,
    brokenPacts: broken,
    totalLocked: ethers.formatEther(totalLocked),
    lifetimePacts: total,
  };
}

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────

export function computeAchievements(pacts: PactData[], score: CommitmentScore): Achievement[] {
  const fulfilled = score.completedPacts;
  const hasGuardian = pacts.some(p => p.ruleType === 'FriendApproval' || p.ruleType === 'TrustedGuardians');
  const has100DayPact = pacts.some(p => {
    if (p.ruleType !== 'TimeLock' || !p.unlockTimestamp) return false;
    const duration = (p.unlockTimestamp - p.createdAt) / 86400;
    return duration >= 100;
  });

  return [
    {
      id: 'first-pact',
      name: 'First Pact',
      description: 'Created your very first commitment.',
      icon: '🌱',
      category: 'commitment',
      earned: pacts.length >= 1,
    },
    {
      id: 'iron-will',
      name: 'Iron Will',
      description: 'Completed 3 pacts without breaking.',
      icon: '🔩',
      category: 'streak',
      earned: fulfilled >= 3,
      progress: Math.min(100, Math.round((fulfilled / 3) * 100)),
      requirement: 3,
    },
    {
      id: 'diamond-hands',
      name: 'Diamond Hands',
      description: 'Completed 10 pacts total.',
      icon: '💎',
      category: 'milestone',
      earned: fulfilled >= 10,
      progress: Math.min(100, Math.round((fulfilled / 10) * 100)),
      requirement: 10,
    },
    {
      id: 'guardian-protected',
      name: 'Guardian Protected',
      description: 'Used trusted guardians to protect a pact.',
      icon: '🛡️',
      category: 'guardian',
      earned: hasGuardian,
    },
    {
      id: '100-day-commitment',
      name: '100-Day Commitment',
      description: 'Created a pact lasting at least 100 days.',
      icon: '📅',
      category: 'commitment',
      earned: has100DayPact,
    },
    {
      id: 'completion-master',
      name: 'Completion Master',
      description: 'Achieved a 100% completion rate with at least 5 pacts.',
      icon: '🏆',
      category: 'milestone',
      earned: score.completionRate === 100 && score.lifetimePacts >= 5,
    },
    {
      id: 'seven-day-discipline',
      name: 'Seven Day Discipline',
      description: 'Maintained a 7-pact completion streak.',
      icon: '🔥',
      category: 'streak',
      earned: score.longestStreak >= 7,
      progress: Math.min(100, Math.round((score.longestStreak / 7) * 100)),
      requirement: 7,
    },
  ];
}

// ─── RULE DESCRIPTIONS ────────────────────────────────────────────────────────

/**
 * Icon values are SVG path IDs resolved by the RuleIcon component in components/ui/RuleIcon.tsx
 * Using string identifiers decouples icon rendering from data — no emoji.
 */
export const RULE_DESCRIPTIONS: Record<RuleType, { title: string; description: string; icon: string; advantages: string[]; useCases: string[] }> = {
  TimeLock: {
    title: 'Time Lock',
    description: 'Funds are locked until a specific date and time. Cannot be released early under any circumstance.',
    icon: 'lock',
    advantages: ['Absolute commitment - no exceptions', 'Ideal for long-term goals', 'Simple and predictable'],
    useCases: ['Emergency fund', 'Investment hold', 'Year-end savings goal'],
  },
  Cooldown: {
    title: 'Cooldown Timer',
    description: 'After requesting release, you must wait a defined period before funds unlock. Protects against impulsive decisions.',
    icon: 'timer',
    advantages: ['Gives you a cooling-off period', 'Allows release eventually', 'Prevents emotional decisions'],
    useCases: ['Trading discipline', 'Crypto HODLing', 'Spending control'],
  },
  FriendApproval: {
    title: 'Friend Approval',
    description: 'A trusted friend or family member must approve your release request. Accountability enforced by someone who knows you.',
    icon: 'handshake',
    advantages: ['Human accountability layer', 'Your guardian knows your goals', 'Social commitment pressure'],
    useCases: ['Weight loss bets', 'Habit building', 'Study goals'],
  },
  TrustedGuardians: {
    title: 'Trusted Guardians',
    description: 'A configurable multi-signature setup. M-of-N guardians must approve before any release. Enterprise-grade accountability.',
    icon: 'shield',
    advantages: ['No single point of failure', 'Configurable consensus', 'Highest accountability level'],
    useCases: ['Business commitments', 'Group savings', 'High-stakes goals'],
  },
  SavingsGoal: {
    title: 'Savings Goal',
    description: 'Funds can only be released once a target deposit amount is reached. Forces you to keep adding.',
    icon: 'target',
    advantages: ['Incentivises regular deposits', 'Clear, measurable goal', 'Satisfaction of achievement'],
    useCases: ['House deposit', 'Vacation fund', 'Education savings'],
  },
};

