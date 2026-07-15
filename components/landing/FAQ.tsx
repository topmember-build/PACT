'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: 'What happens if I try to release early?',
    a: 'The smart contract enforces your rule. If the time lock hasn\'t expired, the release transaction will revert. If you need guardian approval and haven\'t received it, you cannot proceed. The blockchain is the enforcement layer - there are no exceptions.',
  },
  {
    q: 'Is my money safe? Can Pact access my funds?',
    a: 'Pact is a non-custodial platform. Your funds are locked in an audited smart contract on Monad. No team member, administrator, or external party has any access to your locked funds. Only you (with your wallet) can interact with your pact.',
  },
  {
    q: 'What tokens can I lock?',
    a: 'Currently Pact supports MON (native Monad), USDC, USDT, and WETH. More tokens will be added as the ecosystem grows. You can propose tokens via the community.',
  },
  {
    q: 'What is a Trusted Guardian?',
    a: 'A guardian is a trusted wallet address - a friend, partner, parent, or business partner - whose onchain signature is required before you can release funds. You can configure 1-of-1, 2-of-3, or any M-of-N threshold. All approvals are recorded permanently on Monad.',
  },
  {
    q: 'What is the Commitment Score?',
    a: 'Your Commitment Score is a public, onchain metric that tracks your track record. Every fulfilled pact adds points. It is informational for now, but will power reputation, leaderboards, and access to advanced features in future versions.',
  },
  {
    q: 'Can I deposit more funds into an existing pact?',
    a: 'Yes. As long as your pact is Active, you can deposit additional funds at any time. This is especially useful for the Savings Goal rule.',
  },
  {
    q: 'What network does Pact run on?',
    a: 'Pact is built natively on Monad - a high-performance EVM-compatible blockchain with 10,000 TPS, 400ms block times, and 800ms finality. This makes pact interactions near-instant and extremely gas-efficient.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="section" id="faq">
      <div className="container-sm">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-heading-xl"
          >
            Frequently asked
          </motion.h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full glass-card p-5 text-left flex items-center justify-between gap-4 hover:border-white/15"
                aria-expanded={open === i}
              >
                <span className="font-medium text-white/90 text-sm">{faq.q}</span>
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 text-white/40"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </motion.span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-2 text-sm text-white/55 leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
