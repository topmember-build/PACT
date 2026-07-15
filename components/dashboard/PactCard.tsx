'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Badge from '../ui/Badge';
import ProgressRing from '../ui/ProgressRing';
import RuleIcon from '../ui/RuleIcon';
import type { PactData } from '../../lib/types';
import { formatCountdown, validateRelease, RULE_DESCRIPTIONS } from '../../lib/pactUtils';
import { usePreferences } from '../../context/PreferencesContext';

interface PactCardProps {
  pact: PactData;
}

export default function PactCard({ pact }: PactCardProps) {
  const { prefs } = usePreferences();
  const rule = RULE_DESCRIPTIONS[pact.ruleType];
  const validation = validateRelease(pact);

  let progress = 0;
  if (pact.ruleType === 'TimeLock' && pact.unlockTimestamp && pact.createdAt) {
    const total = pact.unlockTimestamp - pact.createdAt;
    const elapsed = Math.floor(Date.now() / 1000) - pact.createdAt;
    progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
  } else if (pact.ruleType === 'TrustedGuardians' || pact.ruleType === 'FriendApproval') {
    progress = pact.guardianThreshold > 0
      ? (pact.guardianApprovalCount / pact.guardianThreshold) * 100
      : 0;
  } else if (pact.ruleType === 'SavingsGoal' && pact.targetAmount) {
    progress = pact.targetAmount > 0n
      ? Math.min(100, Number((pact.amount * 100n) / pact.targetAmount))
      : 0;
  }

  const countdown = pact.ruleType === 'TimeLock' && pact.unlockTimestamp
    ? formatCountdown(pact.unlockTimestamp)
    : null;

  return (
    <Link href={`/pact/${pact.id}`}>
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className={`glass-card ${prefs.compactCards ? 'p-3 gap-2' : 'p-5 gap-4'} h-full flex flex-col cursor-pointer`}
        role="article"
        aria-label={`Pact: ${pact.name}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary ${prefs.compactCards ? 'scale-75 origin-left' : ''}`}>
              <RuleIcon icon={rule.icon} size={16} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-sm truncate">{pact.name}</h3>
              {!prefs.compactCards && <p className="text-xs text-white/40 mt-0.5">{rule.title}</p>}
            </div>
          </div>
          <Badge label={pact.status} status={pact.status} />
        </div>

        {/* Amount + Progress */}
        <div className="flex items-center gap-3">
          <ProgressRing progress={progress} size={prefs.compactCards ? 42 : 56} strokeWidth={prefs.compactCards ? 3 : 4}>
            <span className={`${prefs.compactCards ? 'text-[9px]' : 'text-[10px]'} font-mono text-white/60`}>{Math.round(progress)}%</span>
          </ProgressRing>
          <div>
            <div className={`${prefs.compactCards ? 'text-lg' : 'text-xl'} font-bold text-white`}>
              {pact.amountFormatted}
              <span className="text-sm text-white/50 ml-1.5">{pact.tokenSymbol}</span>
            </div>
            {countdown && !countdown.expired && (
              <div className="flex items-center gap-1.5 text-xs text-white/40 mt-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" /><polyline points="12 6 12 12 16 14" />
                </svg>
                {countdown.label}
              </div>
            )}
            {countdown && countdown.expired && (
              <div className="flex items-center gap-1.5 text-xs text-green-400 mt-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Ready to release
              </div>
            )}
            {(pact.ruleType === 'FriendApproval' || pact.ruleType === 'TrustedGuardians') && (
              <div className="flex items-center gap-1.5 text-xs text-white/40 mt-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                {pact.guardianApprovalCount}/{pact.guardianThreshold} approvals
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {!prefs.compactCards && (
          <div className="mt-auto pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-white/30">
              {new Date(pact.createdAt * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {pact.status === 'Active' && validation.canRelease && (
              <span className="text-xs text-green-400 font-medium">Release available →</span>
            )}
            {pact.status === 'Fulfilled' && (
              <span className="text-xs text-purple-300 font-medium">Fulfilled</span>
            )}
          </div>
        )}
      </motion.div>
    </Link>
  );
}
