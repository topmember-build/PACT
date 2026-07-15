'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="text-sm uppercase tracking-widest text-primary/80 mb-3 font-medium">
            Documentation
          </div>
          <h1 className="text-heading-xl mb-4">Pact Protocol Docs</h1>
          <p className="text-white/50 text-lg">
            Understand how Pact uses smart contracts on Monad to enforce your commitments.
          </p>
        </motion.div>

        <div className="space-y-12">
          {/* Section 1 */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">1. What is Pact?</h2>
            <div className="space-y-4 text-white/70 leading-relaxed text-sm">
              <p>
                Pact is an onchain accountability protocol. It solves the problem of fading human willpower by allowing you to cryptographically lock capital behind specific, rule-based conditions.
              </p>
              <p>
                Once a Pact is sealed, your funds are held by an immutable smart contract. Neither you, nor the Pact development team, nor anyone else can access or release those funds until the exact conditions of your chosen rule are satisfied.
              </p>
            </div>
          </motion.section>

          {/* Section 2 */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">2. The Rule Engine</h2>
            <div className="space-y-6 text-white/70 leading-relaxed text-sm">
              <p>
                Pact uses a modular rule engine. When you create a pact, you select one rule to govern it.
              </p>
              <div className="grid gap-4">
                <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                  <h3 className="text-white font-semibold mb-1">Time Lock</h3>
                  <p className="text-white/50">Funds are strictly locked until a specific UNIX timestamp is reached. Calling release before this time will trigger a contract revert.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                  <h3 className="text-white font-semibold mb-1">Cooldown</h3>
                  <p className="text-white/50">You must formally request a release via the smart contract, which starts a countdown timer (e.g. 7 days). Funds can only be released after the timer expires.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                  <h3 className="text-white font-semibold mb-1">Trusted Guardians (M-of-N)</h3>
                  <p className="text-white/50">You assign 1 to 5 trusted wallet addresses. To release your funds, a required threshold of those guardians must call `approveRelease` onchain.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                  <h3 className="text-white font-semibold mb-1">Savings Goal</h3>
                  <p className="text-white/50">Funds are locked until the total deposited amount reaches your predefined target. You can continuously deposit into the pact over time.</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 3 */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">3. Supported Networks</h2>
            <div className="space-y-4 text-white/70 leading-relaxed text-sm">
              <p>
                Pact is built natively for <strong>Monad</strong>. Monad's 10,000 TPS, 400ms block times, and extremely low fees make it the perfect environment for frequent, micro-interactions with smart contracts.
              </p>
              <p>
                Currently deployed on <strong>Monad Testnet (Chain ID 10143)</strong>.
              </p>
            </div>
          </motion.section>

          {/* Section 4 */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">4. Smart Contract Security</h2>
            <div className="space-y-4 text-white/70 leading-relaxed text-sm">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Non-Custodial:</strong> The protocol has no administrative backdoors. <code>owner</code> modifiers restrict withdrawals strictly to the pact creator.</li>
                <li><strong>Reentrancy Protection:</strong> OpenZeppelin's <code>ReentrancyGuard</code> protects all state-modifying functions.</li>
                <li><strong>Checks-Effects-Interactions:</strong> Internal state (like marking a pact fulfilled and zeroing the balance) is updated before any external value transfers occur.</li>
                <li><strong>Safe ERC20:</strong> We use OpenZeppelin's <code>SafeERC20</code> library to handle edge-cases with non-standard token implementations.</li>
              </ul>
            </div>
          </motion.section>
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/create" className="btn btn-primary">
            Start Building Your First Pact
          </Link>
        </div>
      </div>
    </div>
  );
}
