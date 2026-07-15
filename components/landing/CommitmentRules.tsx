'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RULE_DESCRIPTIONS } from '../../lib/pactUtils';
import RuleIcon from '../ui/RuleIcon';
import type { RuleType } from '../../lib/types';

const rules: RuleType[] = ['TimeLock', 'Cooldown', 'FriendApproval', 'TrustedGuardians', 'SavingsGoal'];

export default function CommitmentRules() {
  const [active, setActive] = useState<RuleType>('TimeLock');
  const rule = RULE_DESCRIPTIONS[active];

  return (
    <section className="section bg-[radial-gradient(ellipse_80%_40%_at_50%_50%,rgba(123,97,255,0.06)_0%,transparent_70%)]" id="rules">
      <div className="container">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm uppercase tracking-widest text-primary/80 mb-3 font-medium"
          >
            Commitment Rules
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-heading-xl"
          >
            Every commitment,<br />your <span className="gradient-text">rules</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/50 mt-4 max-w-xl mx-auto"
          >
            Choose the enforcement mechanism that matches the commitment you need to keep.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-8">
          {rules.map(r => {
            const info = RULE_DESCRIPTIONS[r];
            return (
              <button
                key={r}
                onClick={() => setActive(r)}
                className={`px-4 py-3.5 rounded-xl text-sm text-left transition-all duration-200 border ${
                  active === r
                    ? 'bg-primary/15 border-primary/40 text-white glow-purple-sm'
                    : 'glass border-white/[0.06] text-white/60 hover:text-white hover:border-white/15'
                }`}
              >
                <div className={`mb-2 ${active === r ? 'text-primary' : 'text-white/50'}`}>
                  <RuleIcon icon={info.icon} size={20} strokeWidth={1.75} />
                </div>
                <div className="font-medium text-xs leading-snug">{info.title}</div>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="glass-card p-8 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="md:col-span-1">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mb-5 text-primary">
                <RuleIcon icon={rule.icon} size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-heading-md text-white mb-3">{rule.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{rule.description}</p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-primary/70 mb-4 font-medium">Advantages</h4>
              <ul className="space-y-3">
                {rule.advantages.map(a => (
                  <li key={a} className="flex items-start gap-2.5 text-sm text-white/70">
                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-primary/70 mb-4 font-medium">Use Cases</h4>
              <ul className="space-y-3">
                {rule.useCases.map(u => (
                  <li key={u} className="flex items-start gap-2.5 text-sm text-white/70">
                    <span className="mt-0.5 flex-shrink-0 text-primary/60">→</span>
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
