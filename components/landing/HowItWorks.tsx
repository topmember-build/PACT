'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// SVG icon paths for each step — no emoji
const STEP_ICONS = [
  // 01 Connect wallet
  <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
  // 02 Create pact
  <><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></>,
  // 03 Seal
  <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  // 04 Prove yourself
  <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></>,
  // 05 Claim reward
  <><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></>,
];

const steps = [
  {
    number: '01',
    title: 'Connect Your Wallet',
    description: 'Link your Monad-compatible wallet. No registration. No email. Just your keys.',
  },
  {
    number: '02',
    title: 'Create Your Pact',
    description: 'Choose a token, set an amount, select your enforcement rule, and write a message to your future self.',
  },
  {
    number: '03',
    title: 'Seal The Commitment',
    description: 'Sign the transaction. Your funds are locked by the smart contract. The blockchain witnesses your promise.',
  },
  {
    number: '04',
    title: 'Prove Yourself',
    description: 'Fulfill your rule conditions - wait out the time lock, collect guardian approvals, or hit your savings goal.',
  },
  {
    number: '05',
    title: 'Claim Your Reward',
    description: 'When all conditions are met, release your funds and earn your Commitment Score. Future You is proud.',
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={sectionRef} className="section" id="how-it-works">
      <div className="container">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm uppercase tracking-widest text-primary/80 mb-3 font-medium"
          >
            The Process
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-heading-xl"
          >
            From intention to <span className="gradient-text">immutable commitment</span>
          </motion.h2>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-12 left-1/2 -translate-x-1/2 w-px h-[calc(100%-6rem)] bg-white/5">
            <motion.div 
              style={{ height: lineHeight }} 
              className="w-full bg-gradient-to-b from-primary via-primary/50 to-transparent" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`glass-card p-6 flex gap-5 ${
                  i === 4 ? 'lg:col-span-2 lg:max-w-lg lg:mx-auto' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl glass-purple flex items-center justify-center text-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      {STEP_ICONS[i]}
                    </svg>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono text-primary/60 mb-1">{step.number}</div>
                  <h3 className="text-base font-semibold text-white mb-1.5">{step.title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
