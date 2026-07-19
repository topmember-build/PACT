'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useWallet } from '../../context/WalletContext';
import type { WizardState, RuleConfig, Token } from '../../lib/types';
import { SUPPORTED_TOKENS, getNativeToken } from '../../lib/tokens';
import { RULE_DESCRIPTIONS, validateRelease, formatCountdown, formatRelativeTime, formatAmount } from '../../lib/pactUtils';
import RuleIcon from '../../components/ui/RuleIcon';
import type { RuleType } from '../../lib/types';
import {
  getSignerAndContract,
  encodeTimeLockParams,
  encodeCooldownParams,
  encodeSavingsGoalParams,
  encodeEmptyParams,
  CONTRACT_ADDRESS,
} from '../../lib/contract';
import { RULE_TYPE_INDEX } from '../../lib/types';
import { ethers } from 'ethers';
import { useToast } from '../../context/ToastContext';

// ─── INITIAL STATE ─────────────────────────────────────────────────────────────

const INITIAL_STATE: WizardState = {
  name: '',
  token: getNativeToken(),
  amount: '',
  rule: { type: 'TimeLock' },
  futureMessage: '',
  whyCommitting: '',
  consequence: '',
};

const STEP_LABELS = [
  'Choose Token',
  'Set Amount',
  'Pick Rule',
  'Future Me',
  'Review',
  'Seal Pact',
];

// ─── STEP PROGRESS BAR ────────────────────────────────────────────────────────

function StepProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 border ${
                i + 1 < step
                  ? 'bg-primary border-primary text-white'
                  : i + 1 === step
                  ? 'border-primary text-primary bg-primary/15'
                  : 'border-white/15 text-white/30'
              }`}
            >
              {i + 1 < step ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : i + 1}
            </div>
            <span className={`text-[10px] text-center hidden sm:block ${i + 1 === step ? 'text-primary' : 'text-white/25'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
          animate={{ width: `${((step - 1) / (total - 1)) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ─── STEP 1: TOKEN ────────────────────────────────────────────────────────────

function Step1Token({ state, onChange }: { state: WizardState; onChange: (t: Token) => void }) {
  return (
    <div>
      <h2 className="text-heading-md mb-2">Choose your token</h2>
      <p className="text-white/50 text-sm mb-6">Select the asset you want to lock in this commitment.</p>

      <div className="space-y-3">
        {SUPPORTED_TOKENS.map(token => (
          <button
            key={token.symbol}
            onClick={() => onChange(token)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              state.token?.symbol === token.symbol
                ? 'border-primary/50 bg-primary/10 glow-purple-sm'
                : 'border-white/8 glass hover:border-white/20'
            }`}
            id={`token-${token.symbol}`}
          >
            <div className="w-10 h-10 rounded-full glass-purple flex items-center justify-center text-xl flex-shrink-0">
              <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white">{token.symbol}</div>
              <div className="text-xs text-white/40">{token.name}</div>
            </div>
            {token.isNative && (
              <span className="text-xs text-primary/70 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                Native
              </span>
            )}
            {state.token?.symbol === token.symbol && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── STEP 2: AMOUNT ───────────────────────────────────────────────────────────

function Step2Amount({ state, onChange }: { state: WizardState; onChange: (v: string) => void }) {
  const shortcuts = ['25%', '50%', '75%', '100%'];

  return (
    <div>
      <h2 className="text-heading-md mb-2">Set your amount</h2>
      <p className="text-white/50 text-sm mb-6">
        How much {state.token?.symbol} will you commit? This amount will be locked in the smart contract.
      </p>

      {/* Amount Input */}
      <div className="relative mb-4">
        <input
          type="number"
          value={state.amount}
          onChange={e => onChange(e.target.value)}
          placeholder="0.00"
          step="any"
          min="0"
          className="input-base text-3xl font-bold pr-24 py-6"
          id="amount-input"
          aria-label="Amount to lock"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-medium">
          {state.token?.symbol}
        </div>
      </div>

      {/* Percentage shortcuts */}
      <div className="flex gap-2 mb-6">
        {shortcuts.map(s => (
          <button
            key={s}
            onClick={() => {
              // In a real app, this would use actual wallet balance
              // For now, set a placeholder value
              const pct = parseInt(s) / 100;
              onChange((pct * 10).toFixed(3)); // placeholder: 10 MON = 100%
            }}
            className="flex-1 py-2 rounded-lg border border-white/10 text-xs text-white/60 hover:border-primary/40 hover:text-white hover:bg-primary/10 transition-all"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Amount validation feedback */}
      {state.amount && parseFloat(state.amount) > 0 && (
        <div className="glass-purple rounded-xl p-4 text-sm">
          <div className="flex items-center gap-2 text-primary/80">
            <span>💡</span>
            <span>
              You'll lock <strong className="text-white">{state.amount} {state.token?.symbol}</strong> in this pact.
              This amount will be inaccessible until your commitment rule is satisfied.
            </span>
          </div>
        </div>
      )}

      {state.amount && parseFloat(state.amount) <= 0 && (
        <p className="text-red-400 text-sm">Amount must be greater than 0.</p>
      )}
    </div>
  );
}

// ─── STEP 3: RULE ─────────────────────────────────────────────────────────────

function Step3Rules({ state, onChange }: {
  state: WizardState;
  onChange: (rule: RuleConfig) => void;
}) {
  const rules: RuleType[] = ['TimeLock', 'Cooldown', 'FriendApproval', 'TrustedGuardians', 'SavingsGoal'];
  const [guardianInputs, setGuardianInputs] = useState<string[]>(state.rule.guardians ?? ['']);

  function selectRule(type: RuleType) {
    onChange({ type });
  }

  function updateTimeLockDate(dateStr: string) {
    const ts = Math.floor(new Date(dateStr).getTime() / 1000);
    onChange({ ...state.rule, type: 'TimeLock', unlockTimestamp: ts, unlockDate: dateStr });
  }

  function updateCooldown(days: string) {
    const d = parseInt(days) || 0;
    onChange({ ...state.rule, type: 'Cooldown', cooldownDays: d, cooldownSeconds: d * 86400 });
  }

  function updateGuardians(inputs: string[], threshold: number) {
    const valid = inputs.filter(g => g.trim());
    onChange({ ...state.rule, guardians: inputs, threshold: Math.min(threshold, valid.length) });
    setGuardianInputs(inputs);
  }

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div>
      <h2 className="text-heading-md mb-2">Choose your rule</h2>
      <p className="text-white/50 text-sm mb-6">
        This rule determines when and how your funds can be released.
      </p>

      {/* Rule grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {rules.map(r => {
          const info = RULE_DESCRIPTIONS[r];
          return (
            <button
              key={r}
              onClick={() => selectRule(r)}
              className={`p-4 rounded-xl border text-left transition-all ${
                state.rule.type === r
                  ? 'border-primary/50 bg-primary/10 glow-purple-sm'
                  : 'border-white/8 glass hover:border-white/20'
              }`}
              id={`rule-${r}`}
            >
              <div className={`mb-2 ${state.rule.type === r ? 'text-primary' : 'text-white/50'}`}>
                <RuleIcon icon={info.icon} size={20} strokeWidth={1.75} />
              </div>
              <div className="font-medium text-white text-sm">{info.title}</div>
              <div className="text-xs text-white/40 mt-1 leading-relaxed">{info.description.split('.')[0]}.</div>
            </button>
          );
        })}
      </div>

      {/* Rule-specific config */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state.rule.type}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {state.rule.type === 'TimeLock' && (
            <div className="glass-purple rounded-xl p-5">
              <label className="block text-sm font-medium text-white mb-2">Unlock Date</label>
              <input
                type="date"
                min={minDateStr}
                value={state.rule.unlockDate ?? ''}
                onChange={e => updateTimeLockDate(e.target.value)}
                className="input-base"
                id="timelock-date-input"
                aria-label="Unlock date"
              />
              {state.rule.unlockDate && (
                <p className="text-xs text-white/50 mt-2">
                  🔒 Locked until {new Date(state.rule.unlockDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
            </div>
          )}

          {state.rule.type === 'Cooldown' && (
            <div className="glass-purple rounded-xl p-5">
              <label className="block text-sm font-medium text-white mb-2">Cooldown Period</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={state.rule.cooldownDays ?? 7}
                  onChange={e => updateCooldown(e.target.value)}
                  className="input-base w-28"
                  id="cooldown-days-input"
                  aria-label="Cooldown days"
                />
                <span className="text-white/60">days</span>
              </div>
              <p className="text-xs text-white/50 mt-2">
                After requesting release, you must wait {state.rule.cooldownDays ?? 7} days before funds unlock.
              </p>
            </div>
          )}

          {(state.rule.type === 'FriendApproval' || state.rule.type === 'TrustedGuardians') && (
            <div className="glass-purple rounded-xl p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-3">Guardian Addresses</label>
                <div className="space-y-2">
                  {guardianInputs.map((g, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`0x... Guardian ${i + 1}`}
                        value={g}
                        onChange={e => {
                          const next = [...guardianInputs];
                          next[i] = e.target.value;
                          updateGuardians(next, state.rule.threshold ?? 1);
                        }}
                        className="input-base flex-1 font-mono text-sm"
                        id={`guardian-${i}-input`}
                        aria-label={`Guardian ${i + 1} address`}
                      />
                      {guardianInputs.length > 1 && (
                        <button
                          onClick={() => {
                            const next = guardianInputs.filter((_, j) => j !== i);
                            updateGuardians(next, Math.min(state.rule.threshold ?? 1, next.length));
                          }}
                          className="p-2 text-white/40 hover:text-red-400 transition-colors"
                          aria-label={`Remove guardian ${i + 1}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {state.rule.type === 'TrustedGuardians' && guardianInputs.length < 5 && (
                  <button
                    onClick={() => updateGuardians([...guardianInputs, ''], state.rule.threshold ?? 1)}
                    className="mt-2 text-sm text-primary/70 hover:text-primary transition-colors"
                  >
                    + Add guardian
                  </button>
                )}
              </div>

              {/* Threshold */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Required approvals: {state.rule.threshold ?? 1} of {guardianInputs.filter(g => g.trim()).length || 1}
                </label>
                <input
                  type="range"
                  min={1}
                  max={Math.max(1, guardianInputs.filter(g => g.trim()).length)}
                  value={state.rule.threshold ?? 1}
                  onChange={e => updateGuardians(guardianInputs, parseInt(e.target.value))}
                  className="w-full accent-primary"
                  id="threshold-range"
                  aria-label="Guardian threshold"
                />
              </div>
            </div>
          )}

          {state.rule.type === 'SavingsGoal' && (
            <div className="glass-purple rounded-xl p-5">
              <label className="block text-sm font-medium text-white mb-2">Savings Target</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="0.00"
                  value={state.rule.targetAmount ?? ''}
                  onChange={e => onChange({ ...state.rule, targetAmount: e.target.value })}
                  className="input-base flex-1"
                  id="savings-goal-input"
                  aria-label="Savings goal amount"
                />
                <span className="text-white/60">{state.token?.symbol}</span>
              </div>
              <p className="text-xs text-white/50 mt-2">
                Release only becomes available once the locked amount reaches this target.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── STEP 4: FUTURE ME ────────────────────────────────────────────────────────

function Step4FutureMe({ state, onChange }: {
  state: WizardState;
  onChange: (field: Partial<WizardState>) => void;
}) {
  return (
    <div>
      <h2 className="text-heading-md mb-2">A message to your future self</h2>
      <p className="text-white/50 text-sm mb-8">
        This message is stored permanently onchain. Future You will read it when they try to break this commitment.
      </p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Why are you making this commitment? <span className="text-primary">*</span>
          </label>
          <textarea
            value={state.whyCommitting}
            onChange={e => onChange({ whyCommitting: e.target.value })}
            placeholder="I'm locking these funds because I know my past self makes emotional decisions…"
            className="input-base h-28"
            id="why-committing-textarea"
            aria-label="Why are you committing"
            maxLength={500}
          />
          <div className="text-right text-xs text-white/25 mt-1">{state.whyCommitting.length}/500</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            What do you want Future You to remember? <span className="text-primary">*</span>
          </label>
          <textarea
            value={state.futureMessage}
            onChange={e => onChange({ futureMessage: e.target.value })}
            placeholder="Remember why you started. The version of you reading this made a promise…"
            className="input-base h-36"
            id="future-message-textarea"
            aria-label="Message to future self"
            maxLength={800}
          />
          <div className="text-right text-xs text-white/25 mt-1">{state.futureMessage.length}/800</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            What happens if you break this promise?
          </label>
          <textarea
            value={state.consequence}
            onChange={e => onChange({ consequence: e.target.value })}
            placeholder="If I release early, I'm proving I can't be trusted with my own decisions…"
            className="input-base h-24"
            id="consequence-textarea"
            aria-label="Consequence of breaking"
            maxLength={300}
          />
        </div>
      </div>

      {/* Preview */}
      {(state.futureMessage || state.whyCommitting) && (
        <div className="mt-6 glass-purple rounded-xl p-5 border border-primary/20">
          <div className="text-xs uppercase tracking-widest text-primary/60 mb-3 font-medium">Message Preview</div>
          {state.whyCommitting && (
            <p className="text-sm text-white/70 italic mb-3">"{state.whyCommitting}"</p>
          )}
          {state.futureMessage && (
            <p className="text-sm text-white/90 font-medium">"{state.futureMessage}"</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── STEP 5: REVIEW ───────────────────────────────────────────────────────────

function Step5Review({ state }: { state: WizardState }) {
  const rule = RULE_DESCRIPTIONS[state.rule.type];

  const ruleDetail = () => {
    switch (state.rule.type) {
      case 'TimeLock': return state.rule.unlockDate ? `Until ${new Date(state.rule.unlockDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : 'Date not set';
      case 'Cooldown': return `${state.rule.cooldownDays ?? 7} day cooldown after request`;
      case 'FriendApproval': return '1 guardian approval required';
      case 'TrustedGuardians': return `${state.rule.threshold ?? 1} of ${(state.rule.guardians ?? []).filter(Boolean).length} guardians`;
      case 'SavingsGoal': return `${state.rule.targetAmount} ${state.token?.symbol} target`;
    }
  };

  const rows = [
    { label: 'Pact Name', value: state.name },
    { label: 'Token', value: <span className="flex items-center gap-1.5"><img src={state.token?.logo} alt={state.token?.symbol} className="w-4 h-4 rounded-full" /><span>{state.token?.symbol}</span></span> },
    { label: 'Amount', value: `${state.amount} ${state.token?.symbol}` },
    { label: 'Rule', value: <span className="flex items-center gap-1.5 text-primary"><RuleIcon icon={rule.icon} size={14} strokeWidth={2} /><span className="text-white">{rule.title}</span></span> },
    { label: 'Rule Detail', value: ruleDetail() ?? '-' },
    { label: 'Network', value: '⚡ Monad' },
  ];

  if (state.rule.guardians?.some(Boolean)) {
    rows.push({ label: 'Guardians', value: state.rule.guardians!.filter(Boolean).map(g => `${g.slice(0,6)}…${g.slice(-4)}`).join(', ') });
  }

  return (
    <div>
      <h2 className="text-heading-md mb-2">Review your pact</h2>
      <p className="text-white/50 text-sm mb-6">
        Confirm every detail. Once sealed, this commitment is immutable.
      </p>

      {/* Summary card */}
      <div className="glass-card p-6 mb-5">
        <div className="space-y-4">
          {rows.map(row => (
            <div key={row.label} className="flex justify-between items-start gap-4 py-2 border-b border-white/[0.05] last:border-0">
              <span className="text-sm text-white/45 flex-shrink-0">{row.label}</span>
              <span className="text-sm text-white font-medium text-right break-all">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Future Message Preview */}
      {state.futureMessage && (
        <div className="glass-purple rounded-xl p-5 mb-5 border border-primary/20">
          <div className="text-xs uppercase tracking-widest text-primary/60 mb-2 font-medium">Your Message to Future You</div>
          <p className="text-sm text-white/80 italic leading-relaxed">"{state.futureMessage}"</p>
        </div>
      )}

      {/* Warning */}
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/8 p-4">
        <div className="flex items-start gap-2.5 text-sm text-yellow-300/80">
          <span className="flex-shrink-0 mt-0.5">⚠️</span>
          <span>
            By sealing this pact, you agree that your funds will be locked by the smart contract
            and cannot be accessed until all rule conditions are satisfied.
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── STEP 6: SEAL CEREMONY ────────────────────────────────────────────────────

type SealStage = 'idle' | 'darkening' | 'particles' | 'forming' | 'message' | 'signing' | 'confirming' | 'sealed' | 'error';

function Step6Seal({ state, onSealed }: { state: WizardState; onSealed: (pactId: string) => void }) {
  const [stage, setStage] = useState<SealStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [pactId, setPactId] = useState<string | null>(null);
  const { toast } = useToast();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Particle canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || stage === 'idle') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    const count = stage === 'sealed' ? 80 : 40;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      r: 0.5 + Math.random() * 3,
      vx: (Math.random() - 0.5) * (stage === 'sealed' ? 0.8 : 0.4),
      vy: (Math.random() - 0.5) * (stage === 'sealed' ? 0.8 : 0.4),
      alpha: 0.15 + Math.random() * 0.7,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.offsetWidth;
        if (p.x > canvas.offsetWidth) p.x = 0;
        if (p.y < 0) p.y = canvas.offsetHeight;
        if (p.y > canvas.offsetHeight) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${stage === 'sealed' ? '183,165,255' : '123,97,255'},${p.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [stage]);

  async function startSeal() {
    setError(null);
    setStage('darkening');

    try {
      await new Promise(r => setTimeout(r, 600));
      setStage('particles');
      await new Promise(r => setTimeout(r, 800));
      setStage('forming');
      await new Promise(r => setTimeout(r, 600));
      setStage('message');
      await new Promise(r => setTimeout(r, 1000));
      setStage('signing');

      // Build transaction
      const { signer, contract } = await getSignerAndContract();

      // Encode rule params
      let ruleParams: string;
      let ruleTypeIndex: number;
      let guardianThreshold = 0;

      switch (state.rule.type) {
        case 'TimeLock':
          ruleTypeIndex = 0;
          ruleParams = encodeTimeLockParams(state.rule.unlockTimestamp!);
          break;
        case 'Cooldown':
          ruleTypeIndex = 1;
          ruleParams = encodeCooldownParams(state.rule.cooldownSeconds!);
          break;
        case 'FriendApproval':
          ruleTypeIndex = 2;
          ruleParams = encodeEmptyParams();
          guardianThreshold = 1;
          break;
        case 'TrustedGuardians':
          ruleTypeIndex = 3;
          ruleParams = encodeEmptyParams();
          guardianThreshold = state.rule.threshold ?? 1;
          break;
        case 'SavingsGoal':
          ruleTypeIndex = 4;
          ruleParams = encodeSavingsGoalParams(
            ethers.parseUnits(state.rule.targetAmount ?? '0', state.token!.decimals)
          );
          break;
        default:
          throw new Error('Unknown rule type');
      }

      const fullMessage = [
        state.whyCommitting,
        state.futureMessage,
        state.consequence,
      ].filter(Boolean).join('\n\n---\n\n');

      // Create pact tx
      // We pass a manual gasLimit to skip eth_estimateGas and force the MetaMask popup instantly.
      const createTx = await contract.createPact(
        state.token!.address,
        ruleTypeIndex,
        ruleParams,
        state.name,
        fullMessage,
        guardianThreshold,
        { gasLimit: 800000 }
      );

      setStage('confirming');
      setTxHash(createTx.hash);

      const receipt = await createTx.wait();

      // Parse pact ID
      let createdPactId: string | undefined;
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed?.name === 'PactCreated') {
            createdPactId = parsed.args.pactId.toString();
            break;
          }
        } catch { continue; }
      }
      if (!createdPactId) throw new Error('Could not parse PactCreated event');

      // Assign guardians if needed
      const validGuardians = (state.rule.guardians ?? []).filter(g => g.trim() && ethers.isAddress(g));
      if (validGuardians.length > 0 && (state.rule.type === 'FriendApproval' || state.rule.type === 'TrustedGuardians')) {
        const guardianTx = await contract.assignGuardians(createdPactId, validGuardians, { gasLimit: 300000 });
        await guardianTx.wait();
      }

      // Deposit funds
      const amountBn = ethers.parseUnits(state.amount, state.token!.decimals);
      if (amountBn > 0n) {
        if (state.token!.isNative) {
          const depositTx = await contract.deposit(createdPactId, { value: amountBn, gasLimit: 200000 });
          await depositTx.wait();
        } else {
          // ERC20: approve first, then deposit
          const erc20 = new ethers.Contract(state.token!.address, [
            'function approve(address spender, uint256 amount) external returns (bool)',
          ], signer);
          const approveTx = await erc20.approve(CONTRACT_ADDRESS, amountBn);
          await approveTx.wait();
          const depositTx = await contract.depositERC20(createdPactId, amountBn);
          await depositTx.wait();
        }
      }

      setPactId(createdPactId);
      setStage('sealed');
      toast('success', 'Pact Sealed!', `Your commitment #${createdPactId} is now enforced onchain.`);
    } catch (e: any) {
      console.error(e);
      let msg = e?.reason || e?.message || 'Transaction failed';
      
      // Parse ugly ethers/MetaMask RPC errors
      if (msg.includes('Failed to fetch') || msg.includes('could not coalesce error')) {
        msg = 'RPC Error: MetaMask failed to connect to the Monad network. Please try again, or update your Monad Testnet RPC URL in MetaMask.';
      } else if (msg.includes('user rejected')) {
        msg = 'Transaction was rejected in your wallet.';
      }
      
      setError(msg);
      setStage('error');
      toast('error', 'Seal Failed', msg.slice(0, 100));
    }
  }

  const stageLabels: Record<SealStage, string> = {
    idle: '',
    darkening: 'Preparing…',
    particles: 'Summoning the seal…',
    forming: 'Forming your commitment…',
    message: 'Reading your message…',
    signing: 'Please sign in your wallet',
    confirming: 'Confirming on Monad…',
    sealed: 'Your Pact Has Been Sealed.',
    error: 'Seal failed',
  };

  const isSealing = ['darkening', 'particles', 'forming', 'message', 'signing', 'confirming'].includes(stage);
  const bgOpacity = stage === 'idle' ? 0 : stage === 'darkening' ? 0.5 : 0.85;

  return (
    <div className="relative min-h-[400px] flex flex-col items-center justify-center">
      {/* Cinematic background overlay */}
      <AnimatePresence>
        {stage !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: bgOpacity }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 -inset-x-6 -inset-y-6 bg-black rounded-2xl pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Particle canvas */}
      {stage !== 'idle' && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl" />
      )}

      <div className="relative z-10 text-center w-full">
        {/* Idle state */}
        {stage === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-heading-md mb-2">Seal your pact</h2>
            <p className="text-white/50 text-sm mb-8">
              Sign the transaction to make your commitment immutable. This cannot be undone.
            </p>
            <button
              onClick={startSeal}
              className="btn btn-primary text-lg px-10 py-5 glow-purple"
              id="seal-pact-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Seal Pact
            </button>
          </motion.div>
        )}

        {/* Sealing animation */}
        {isSealing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8"
          >
            {/* Glowing seal ring */}
            <motion.div
              className="mx-auto mb-8 relative"
              style={{ width: 160, height: 160 }}
            >
              <svg width={160} height={160} viewBox="0 0 160 160" className="absolute inset-0">
                {/* Background ring */}
                <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(123,97,255,0.15)" strokeWidth="3" />
                {/* Animated drawing ring */}
                <motion.circle
                  cx="80" cy="80" r="70"
                  fill="none"
                  stroke="#7B61FF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={440}
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: stage === 'forming' || stage === 'message' || stage === 'signing' || stage === 'confirming' ? 0 : 440 }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                  style={{ filter: 'drop-shadow(0 0 8px rgba(123,97,255,0.8))' }}
                  transform="rotate(-90 80 80)"
                />
              </svg>
              {/* Inner glow icon */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  scale: stage === 'signing' ? [1, 1.05, 1] : 1,
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <div className="w-20 h-20 rounded-full glass-purple flex items-center justify-center animate-seal-pulse">
                    {stage === 'confirming' ? (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                    ) : stage === 'signing' ? (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    )}
                </div>
              </motion.div>
            </motion.div>

            {/* Stage label */}
            <motion.p
              key={stage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-medium text-[#ffffff] mb-2"
            >
              {stageLabels[stage]}
            </motion.p>
            {stage === 'signing' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-primary/80 mb-4"
              >
                (If you don't see a popup, check the MetaMask extension icon)
              </motion.p>
            )}

            {/* Future message reveal */}
            {(stage === 'message' || stage === 'signing' || stage === 'confirming') && state.futureMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="glass-purple rounded-xl p-5 max-w-sm mx-auto mt-4 border border-primary/20"
              >
                <p className="text-sm text-[#ffffff]/80 italic leading-relaxed">"{state.futureMessage}"</p>
              </motion.div>
            )}

            {txHash && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-[#ffffff]/30 font-mono mt-4"
              >
                tx: {txHash.slice(0, 20)}…
              </motion.p>
            )}
          </motion.div>
        )}

        {/* SEALED! */}
        {stage === 'sealed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="py-8"
          >
            <motion.div
              className="mx-auto mb-6 w-32 h-32 rounded-full glass-purple flex items-center justify-center animate-seal-pulse"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-display text-[#ffffff] glow-text mb-4"
            >
              Your Pact Has Been Sealed.
            </motion.h2>

            {state.futureMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="glass-purple rounded-xl p-5 max-w-sm mx-auto mb-8 border border-primary/20"
              >
                <div className="text-xs uppercase tracking-widest text-primary/60 mb-2">Your Commitment</div>
                <p className="text-sm text-[#ffffff]/85 italic leading-relaxed">"{state.futureMessage}"</p>
              </motion.div>
            )}

            {pactId && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                onClick={() => onSealed(pactId)}
                className="btn btn-primary text-lg px-10 py-4 glow-purple"
                id="view-pact-btn"
              >
                View Your Pact →
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Error */}
        {stage === 'error' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8">
            <div className="mb-4 text-red-400">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mx-auto"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <h3 className="text-lg font-medium text-[#ffffff] mb-2">Seal Failed</h3>
            <p className="text-sm text-red-400 mb-6 max-w-sm mx-auto">{error}</p>
            <button
              onClick={() => { setStage('idle'); setError(null); }}
              className="btn btn-secondary"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── WIZARD SHELL ─────────────────────────────────────────────────────────────

export default function CreatePactPage() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const router = useRouter();
  const { status, connect } = useWallet();

  if (status !== 'connected') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6 animate-float">✍️</div>
          <h1 className="text-heading-lg mb-4">Connect to create a pact</h1>
          <p className="text-white/50 mb-8">Your commitment journey starts here.</p>
          <button onClick={connect} className="btn btn-primary" id="wizard-connect-btn">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  function canProgress() {
    switch (step) {
      case 1: return !!state.token;
      case 2: return !!state.amount && parseFloat(state.amount) > 0;
      case 3: {
        if (state.rule.type === 'TimeLock') return !!state.rule.unlockTimestamp;
        if (state.rule.type === 'Cooldown') return (state.rule.cooldownSeconds ?? 0) > 0;
        if (state.rule.type === 'SavingsGoal') return !!state.rule.targetAmount && parseFloat(state.rule.targetAmount) > 0;
        return true;
      }
      case 4: return state.futureMessage.length >= 10 && state.whyCommitting.length >= 5;
      case 5: return !!state.name;
      default: return true;
    }
  }

  const TOTAL_STEPS = 6;

  return (
    <div className="min-h-screen py-10">
      <div className="container-sm">
        <div className="mb-8">
          <h1 className="text-heading-lg mb-1">Create a New Pact</h1>
          <p className="text-white/40 text-sm">Make a promise your future self can't break.</p>
        </div>

        {/* Pact name (persistent across steps) */}
        {step <= 5 && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Name your commitment… (e.g. 'Diamond Hands 2026')"
              value={state.name}
              onChange={e => setState(s => ({ ...s, name: e.target.value }))}
              className="input-base"
              maxLength={64}
              id="pact-name-input"
              aria-label="Pact name"
            />
          </div>
        )}

        {/* Progress */}
        <StepProgress step={step} total={TOTAL_STEPS} />

        {/* Step content */}
        <div className="glass-card p-8 min-h-[480px] flex flex-col no-flash">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="no-flash"
              >
                {step === 1 && (
                  <Step1Token state={state} onChange={t => setState(s => ({ ...s, token: t }))} />
                )}
                {step === 2 && (
                  <Step2Amount state={state} onChange={v => setState(s => ({ ...s, amount: v }))} />
                )}
                {step === 3 && (
                  <Step3Rules state={state} onChange={rule => setState(s => ({ ...s, rule }))} />
                )}
                {step === 4 && (
                  <Step4FutureMe state={state} onChange={fields => setState(s => ({ ...s, ...fields }))} />
                )}
                {step === 5 && (
                  <Step5Review state={state} />
                )}
                {step === 6 && (
                  <Step6Seal
                    state={state}
                    onSealed={id => router.push(`/pact/${id}`)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          {step < 6 && (
            <div className="flex justify-between items-center pt-6 mt-6 border-t border-white/[0.06]">
              <button
                onClick={() => setStep(s => Math.max(1, s - 1))}
                className={`btn btn-ghost ${step === 1 ? 'invisible' : ''}`}
              >
                ← Back
              </button>
              <div className="flex items-center gap-3">
                {step === 5 && !state.name && (
                  <span className="text-sm text-red-400 font-medium">Please enter a Pact Name at the top</span>
                )}
                <button
                  onClick={() => setStep(s => Math.min(TOTAL_STEPS, s + 1))}
                  disabled={!canProgress()}
                  className="btn btn-primary"
                  id={`wizard-next-step-${step}`}
                >
                  {step === 5 ? 'Seal Pact' : 'Continue →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
