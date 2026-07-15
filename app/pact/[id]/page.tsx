'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePact } from '../../../lib/hooks/usePact';
import { useWallet } from '../../../context/WalletContext';
import { useToast } from '../../../context/ToastContext';
import { usePreferences } from '../../../context/PreferencesContext';
import {
  validateRelease,
  formatAmount,
  formatAddress,
  formatDate,
  formatCountdown,
  formatRelativeTime,
  RULE_DESCRIPTIONS,
} from '../../../lib/pactUtils';
import { getSignerAndContract } from '../../../lib/contract';
import Badge from '../../../components/ui/Badge';
import ProgressRing from '../../../components/ui/ProgressRing';
import Modal from '../../../components/ui/Modal';
import RuleIcon from '../../../components/ui/RuleIcon';
import type { PactData } from '../../../lib/types';

// ─── COUNTDOWN DISPLAY ───────────────────────────────────────────────────────

function CountdownDisplay({ unlockTimestamp, showSeconds }: { unlockTimestamp: number, showSeconds: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const cd = formatCountdown(unlockTimestamp);

  if (cd.expired) {
    return (
      <div className="flex items-center gap-2 text-green-400 font-semibold">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        Unlocked - Ready to release
      </div>
    );
  }

  const units = [
    { label: 'Days', value: cd.days },
    { label: 'Hours', value: cd.hours },
    { label: 'Mins', value: cd.minutes },
  ];
  if (showSeconds) {
    units.push({ label: 'Secs', value: cd.seconds });
  }

  return (
    <div className="flex items-end gap-3">
      {units.map(u => (
        <div key={u.label} className="text-center">
          <div className="text-3xl font-bold text-white tabular-nums w-14 h-14 rounded-xl glass-purple flex items-center justify-center">
            {String(u.value).padStart(2, '0')}
          </div>
          <div className="text-[10px] text-white/35 mt-1 uppercase tracking-widest">{u.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── PROGRESS RING SECTION ────────────────────────────────────────────────────

function PactProgress({ pact }: { pact: PactData }) {
  let progress = 0;
  let label = '';

  if (pact.ruleType === 'TimeLock' && pact.unlockTimestamp && pact.createdAt) {
    const total = pact.unlockTimestamp - pact.createdAt;
    const elapsed = Math.floor(Date.now() / 1000) - pact.createdAt;
    progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
    label = `${Math.round(progress)}% elapsed`;
  } else if (pact.ruleType === 'FriendApproval' || pact.ruleType === 'TrustedGuardians') {
    progress = pact.guardianThreshold > 0
      ? Math.round((pact.guardianApprovalCount / pact.guardianThreshold) * 100)
      : 0;
    label = `${pact.guardianApprovalCount}/${pact.guardianThreshold} approvals`;
  } else if (pact.ruleType === 'SavingsGoal' && pact.targetAmount && pact.targetAmount > 0n) {
    progress = Math.min(100, Number((pact.amount * 100n) / pact.targetAmount));
    label = `${Math.round(progress)}% of goal`;
  } else if (pact.ruleType === 'Cooldown') {
    if (pact.releaseRequestedAt && pact.cooldownSeconds) {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - pact.releaseRequestedAt;
      progress = Math.min(100, Math.round((elapsed / pact.cooldownSeconds) * 100));
      label = `${Math.round(progress)}% cooldown`;
    } else {
      label = 'Not requested';
    }
  }

  const color =
    pact.status === 'Fulfilled' ? '#4ADE80' :
    pact.status === 'Broken' ? '#F87171' :
    '#7B61FF';

  return (
    <div className="flex items-center gap-5">
      <ProgressRing progress={progress} size={80} strokeWidth={6} color={color}>
        <span className="text-sm font-bold text-white">{Math.round(progress)}%</span>
      </ProgressRing>
      <div>
        <div className="text-sm font-medium text-white capitalize">{label || 'In progress'}</div>
        <div className="text-xs text-white/40 mt-0.5">
          {pact.status === 'Fulfilled' ? 'Commitment honored' :
           pact.status === 'Broken' ? 'Commitment broken' :
           'Commitment active'}
        </div>
      </div>
    </div>
  );
}

// ─── GUARDIAN PANEL ───────────────────────────────────────────────────────────

function GuardianPanel({ pact, guardians }: { pact: PactData; guardians: string[] }) {
  if (!guardians.length) return null;

  return (
    <div className="glass-card p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        Guardians ({pact.guardianApprovalCount}/{pact.guardianThreshold} approved)
      </h3>
      <div className="space-y-2">
        {guardians.map((g, i) => (
          <div key={g} className="flex items-center gap-3 py-2 border-b border-white/[0.05] last:border-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/20 flex items-center justify-center text-xs font-bold text-white">
              {i + 1}
            </div>
            <span className="text-sm font-mono text-white/70 flex-1">
              {formatAddress(g)}
            </span>
            <span className="text-xs px-2 py-1 rounded-full border">
              Pending
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/35 mt-4">
        Share your pact ID with your guardians so they can call <code>approveRelease</code> onchain.
      </p>
    </div>
  );
}

// ─── ACTIVITY TIMELINE ───────────────────────────────────────────────────────

function Timeline({ pact }: { pact: PactData }) {
  const events = [
    {
      svgPath: <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />,
      label: 'Pact Created',
      detail: `Named "${pact.name}"`,
      time: pact.createdAt,
      color: 'text-primary',
    },
    ...(pact.amount > 0n ? [{
      svgPath: <circle cx="12" cy="12" r="9" />,
      label: 'Funds Deposited',
      detail: `${pact.amountFormatted} ${pact.tokenSymbol} locked`,
      time: pact.createdAt,
      color: 'text-green-400',
    }] : []),
    ...(pact.releaseRequestedAt ? [{
      svgPath: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
      label: 'Release Requested',
      detail: 'Awaiting conditions',
      time: pact.releaseRequestedAt,
      color: 'text-yellow-400',
    }] : []),
    ...(pact.status === 'Fulfilled' ? [{
      svgPath: <><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></>,
      label: 'Commitment Fulfilled',
      detail: 'Funds released - Future self is proud',
      time: 0,
      color: 'text-green-400',
    }] : []),
    ...(pact.status === 'Broken' ? [{
      svgPath: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
      label: 'Pact Broken',
      detail: 'Commitment was not honored',
      time: 0,
      color: 'text-red-400',
    }] : []),
  ];

  return (
    <div className="glass-card p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-white/60 uppercase tracking-widest mb-5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
        Timeline
      </h3>
      <div className="relative">
        <div className="absolute left-3.5 top-0 bottom-0 w-px bg-white/[0.06]" />
        <div className="space-y-5">
          {events.map((ev, i) => (
            <div key={i} className="flex items-start gap-4 pl-2">
              <div className={`w-7 h-7 rounded-full glass-purple border border-white/10 flex items-center justify-center flex-shrink-0 z-10 ${ev.color}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {ev.svgPath}
                </svg>
              </div>
              <div className="flex-1 min-w-0 pb-2">
                <div className="text-sm font-medium text-white">{ev.label}</div>
                <div className="text-xs text-white/40 mt-0.5">{ev.detail}</div>
                {ev.time > 0 && (
                  <div className="text-[10px] text-white/25 mt-1 font-mono">
                    {formatDate(ev.time)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── REQUEST RELEASE MODAL ────────────────────────────────────────────────────

function RequestReleaseModal({
  open, onClose, pact, onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  pact: PactData;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const { prefs, playAudio } = usePreferences();
  const [phase, setPhase] = useState<'review' | 'loading' | 'done' | 'error'>('review');
  const [errorMsg, setErrorMsg] = useState('');
  const validation = validateRelease(pact);

  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (open) {
      setPhase('review');
      setErrorMsg('');
      // Always show Future Me message first
      setShowMessage(true);
    }
  }, [open]);

  async function handleAction() {
    if (prefs.confirmBeforeRelease) {
      if (!window.confirm('Are you sure you want to proceed with this action?')) {
        return;
      }
    }

    setPhase('loading');
    try {
      const { contract } = await getSignerAndContract();

      if (validation.canRelease) {
        const tx = await contract.release(pact.id);
        await tx.wait();
        playAudio('success');
        toast('success', 'Pact Fulfilled!', 'Your commitment has been honored. Funds released.');
        setPhase('done');
        onSuccess();
      } else if (validation.canRequest) {
        const tx = await contract.requestRelease(pact.id);
        await tx.wait();
        playAudio('success');
        toast('success', 'Release Requested', 'Your guardians have been notified.');
        setPhase('done');
        onSuccess();
      }
    } catch (e: any) {
      const msg = e?.reason || e?.message || 'Transaction failed';
      setErrorMsg(msg.slice(0, 200));
      setPhase('error');
      toast('error', 'Transaction Failed', msg.slice(0, 100));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Request Release" size="md">
      {/* Future Me message — shown first, always */}
      {showMessage && pact.message && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-purple rounded-xl p-5 mb-5 border border-primary/20"
        >
          <div className="text-xs uppercase tracking-widest text-primary/60 mb-2 font-medium">
            A message from Past You
          </div>
          <p className="text-sm text-white/85 leading-relaxed italic">"{pact.message}"</p>
        </motion.div>
      )}

      {phase === 'review' && (
        <div>
          {/* Rule status */}
          <div className={`rounded-xl p-4 mb-5 border ${
            validation.canRelease
              ? 'border-green-500/25 bg-green-500/8'
              : 'border-yellow-500/25 bg-yellow-500/8'
          }`}>
            <div className={`flex items-start gap-2.5 text-sm ${
              validation.canRelease ? 'text-green-300' : 'text-yellow-300'
            }`}>
              <span className="mt-0.5 flex-shrink-0">
                {validation.canRelease ? '✅' : '⏳'}
              </span>
              <div>
                <div className="font-medium">{validation.reason}</div>
                {validation.detail && (
                  <div className="text-xs mt-1 opacity-75">{validation.detail}</div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button onClick={onClose} className="btn btn-ghost flex-1">
              Keep Commitment
            </button>
            {(validation.canRelease || validation.canRequest) && (
              <button
                onClick={handleAction}
                className={`btn flex-1 ${validation.canRelease ? 'btn-primary' : 'btn-secondary'}`}
                id="confirm-release-btn"
              >
                {validation.canRelease ? 'Release Funds' : 'Request Release'}
              </button>
            )}
          </div>

          {!validation.canRelease && !validation.canRequest && (
            <p className="text-center text-sm text-white/40 mt-4">
              Conditions not yet met. Your commitment protects you.
            </p>
          )}
        </div>
      )}

      {phase === 'loading' && (
        <div className="py-8 text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Processing transaction…</p>
        </div>
      )}

      {phase === 'done' && (
        <div className="py-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <p className="text-white font-semibold">Transaction confirmed.</p>
          <button onClick={onClose} className="btn btn-primary mt-6">Close</button>
        </div>
      )}

      {phase === 'error' && (
        <div className="py-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </div>
          <p className="text-red-400 text-sm mb-6">{errorMsg || 'Transaction failed'}</p>
          <div className="flex gap-3">
            <button onClick={() => setPhase('review')} className="btn btn-ghost flex-1">Back</button>
            <button onClick={handleAction} className="btn btn-secondary flex-1">Retry</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function PactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { address, status } = useWallet();
  const { prefs } = usePreferences();
  const router = useRouter();
  const { pact, guardians, loading, error, refetch } = usePact(id);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);

  const isOwner = pact?.owner?.toLowerCase() === address?.toLowerCase();
  const rule = pact ? RULE_DESCRIPTIONS[pact.ruleType] : null;
  const validation = pact ? validateRelease(pact) : null;

  if (status !== 'connected') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <RuleIcon icon="lock" size={36} strokeWidth={1.5} className="text-primary" />
          </div>
          <h1 className="text-heading-lg mb-4">Connect your wallet</h1>
          <p className="text-white/50 mb-8">To view pact details you need to be connected.</p>
          <Link href="/" className="btn btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40">Loading pact #{id}…</p>
        </div>
      </div>
    );
  }

  if (error || !pact) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <h1 className="text-heading-lg mb-4">Pact not found</h1>
          <p className="text-white/50 mb-8">{error || `Pact #${id} does not exist.`}</p>
          <Link href="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container max-w-4xl">

        {/* Back nav */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <span className="text-white/15">/</span>
          <span className="text-sm text-white/40">Pact #{id}</span>
        </div>

        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-8 mb-6 border border-white/[0.08] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(123,97,255,0.08)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative z-10">
            {/* Title row */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary">
                    {rule && <RuleIcon icon={rule.icon} size={20} strokeWidth={1.75} />}
                  </div>
                  <h1 className="text-2xl font-bold text-white">{pact.name}</h1>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge label={pact.status} status={pact.status} />
                  <span className="text-xs text-white/35">{rule?.title}</span>
                  <span className="text-xs text-white/25">#{pact.id}</span>
                </div>
              </div>
              {/* Amount */}
              <div className="text-right flex-shrink-0">
                <div className="text-3xl font-bold text-white">
                  {pact.amountFormatted}
                  <span className="text-lg text-white/50 ml-2">{pact.tokenSymbol}</span>
                </div>
                <div className="text-xs text-white/35 mt-1">Locked</div>
              </div>
            </div>

            {/* Progress + Countdown */}
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <PactProgress pact={pact} />

              {pact.ruleType === 'TimeLock' && pact.unlockTimestamp && (
                <div className="flex-1">
                  <div className="text-xs text-white/35 uppercase tracking-widest mb-3 font-medium">Time Remaining</div>
                  <CountdownDisplay unlockTimestamp={pact.unlockTimestamp} showSeconds={prefs.showCountdownSeconds} />
                </div>
              )}

              {pact.ruleType === 'Cooldown' && pact.releaseRequestedAt && pact.cooldownSeconds && (
                <div className="flex-1">
                  <div className="text-xs text-white/35 uppercase tracking-widest mb-3 font-medium">Cooldown Ends</div>
                  <CountdownDisplay unlockTimestamp={pact.releaseRequestedAt + pact.cooldownSeconds} showSeconds={prefs.showCountdownSeconds} />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column: details */}
          <div className="lg:col-span-2 space-y-5">

            {/* Future Me Message */}
            {pact.message && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-purple rounded-2xl p-6 border border-primary/20"
              >
                <div className="text-xs uppercase tracking-widest text-primary/60 mb-3 font-medium">
                  📝 Message to Future You
                </div>
                <p className="text-white/85 leading-relaxed italic text-sm">"{pact.message}"</p>
              </motion.div>
            )}

            {/* Rule Details */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card p-5"
            >
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">
                ⚙️ Commitment Rule
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/45">Type</span>
                  <span className="text-white font-medium">{rule?.icon} {rule?.title}</span>
                </div>
                {pact.ruleType === 'TimeLock' && pact.unlockTimestamp && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/45">Unlock Date</span>
                    <span className="text-white font-medium">{formatDate(pact.unlockTimestamp)}</span>
                  </div>
                )}
                {pact.ruleType === 'Cooldown' && pact.cooldownSeconds && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/45">Cooldown</span>
                    <span className="text-white font-medium">{Math.floor(pact.cooldownSeconds / 86400)} days</span>
                  </div>
                )}
                {(pact.ruleType === 'FriendApproval' || pact.ruleType === 'TrustedGuardians') && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/45">Threshold</span>
                    <span className="text-white font-medium">{pact.guardianThreshold} of {guardians.length} guardians</span>
                  </div>
                )}
                {pact.ruleType === 'SavingsGoal' && pact.targetAmount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/45">Target</span>
                    <span className="text-white font-medium">
                      {formatAmount(pact.targetAmount, pact.tokenDecimals)} {pact.tokenSymbol}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-white/45">Owner</span>
                  <span className="text-white font-mono text-xs">{formatAddress(pact.owner)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/45">Created</span>
                  <span className="text-white">{formatDate(pact.createdAt)}</span>
                </div>
              </div>
            </motion.div>

            {/* Guardian Panel */}
            {guardians.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <GuardianPanel pact={pact} guardians={guardians} />
              </motion.div>
            )}

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Timeline pact={pact} />
            </motion.div>
          </div>

          {/* Right column: actions */}
          <div className="space-y-4">

            {/* Release status card */}
            {pact.status === 'Active' && isOwner && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="glass-card p-5"
              >
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">
                  Actions
                </h3>

                {validation && (
                  <div className={`rounded-xl p-3 mb-4 border text-xs ${
                    validation.canRelease
                      ? 'border-green-500/25 bg-green-500/8 text-green-300'
                      : 'border-yellow-500/20 bg-yellow-500/6 text-yellow-300/80'
                  }`}>
                    {validation.reason}
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    onClick={() => setReleaseModalOpen(true)}
                    className={`btn w-full ${
                      validation?.canRelease ? 'btn-primary glow-purple-sm' : 'btn-secondary'
                    }`}
                    id="request-release-btn"
                  >
                    {validation?.canRelease ? '🔓 Release Funds' :
                     validation?.canRequest ? '📤 Request Release' :
                     '🔒 View Release Status'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Fulfilled state */}
            {pact.status === 'Fulfilled' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 text-center border border-green-500/20"
              >
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="font-semibold text-white mb-2">Pact Fulfilled</h3>
                <p className="text-xs text-white/50">You honored your commitment. Future self is grateful.</p>
              </motion.div>
            )}

            {/* Broken state */}
            {pact.status === 'Broken' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 text-center border border-red-500/20"
              >
                <div className="text-4xl mb-3">💔</div>
                <h3 className="font-semibold text-white mb-2">Pact Broken</h3>
                <p className="text-xs text-white/50">This commitment was not honored. Learn and try again.</p>
                <Link href="/create" className="btn btn-secondary w-full mt-4 text-sm" id="pact-try-again-btn">
                  Create New Pact
                </Link>
              </motion.div>
            )}

            {/* Meta card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="glass-card p-5"
            >
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">
                Summary
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Token', value: `${pact.tokenSymbol}` },
                  { label: 'Locked', value: `${pact.amountFormatted} ${pact.tokenSymbol}` },
                  { label: 'Network', value: 'Monad' },
                  { label: 'Pact ID', value: `#${pact.id}` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-white/40">{row.label}</span>
                    <span className="text-white font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Share card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
            >
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                }}
                className="btn btn-ghost w-full text-sm"
                id="share-pact-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" />
                </svg>
                Share Pact
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Release Modal */}
      {pact && (
        <RequestReleaseModal
          open={releaseModalOpen}
          onClose={() => setReleaseModalOpen(false)}
          pact={pact}
          onSuccess={() => {
            setReleaseModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
