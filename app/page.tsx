'use client';

import React, { useRef } from 'react';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import CommitmentRules from '../components/landing/CommitmentRules';
import FAQ from '../components/landing/FAQ';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useWallet } from '../context/WalletContext';

function ProblemSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yParallax = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="section bg-[radial-gradient(ellipse_60%_30%_at_50%_50%,rgba(248,113,113,0.04)_0%,transparent_70%)]" id="problem">
      <div className="container-sm text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm uppercase tracking-widest text-red-400/70 mb-4 font-medium"
        >
          The Problem
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-heading-xl mb-8"
        >
          Intentions fade.<br />Emotions override decisions.
        </motion.h2>
        <motion.div style={{ y: yParallax }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              stat: '92%',
              label: 'of people fail their New Year\'s resolutions',
              icon: '📉',
            },
            {
              stat: '68%',
              label: 'of crypto holders panic-sell during volatility',
              icon: '😰',
            },
            {
              stat: '$0',
              label: 'in accountability infrastructure exists today',
              icon: '🕳️',
            },
          ].map(item => (
            <motion.div
              key={item.stat}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  {item.icon === '📉' && <><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></>}
                  {item.icon === '😰' && <><circle cx="12" cy="12" r="10"/><path d="M8 15h8"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><path d="M12 4c2 0 4 1 4 3"/></>}
                  {item.icon === '🕳️' && <circle cx="12" cy="12" r="10"/>}
                </svg>
              </div>
              <div className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Inter' }}>{item.stat}</div>
              <p className="text-sm text-white/50">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function SolutionSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yParallax = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="section" id="solution">
      <div className="container-sm text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm uppercase tracking-widest text-primary/80 mb-4 font-medium"
        >
          The Solution
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-heading-xl mb-6"
        >
          The blockchain as your<br /><span className="gradient-text">enforcement layer</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-white/55 text-lg leading-relaxed max-w-2xl mx-auto mb-12"
        >
          Pact uses immutable smart contracts on Monad to enforce your commitments.
          Once sealed, your funds cannot be released until you prove you kept your word.
          No willpower required - just the math of cryptographic enforcement.
        </motion.p>
        <motion.div style={{ y: yParallax }} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🔒', title: 'Immutable', desc: 'Sealed by smart contract. No exceptions.' },
            { icon: '⚡', title: 'Instant', desc: '400ms finality on Monad.' },
            { icon: '🌐', title: 'Trustless', desc: 'No custodian. You control your keys.' },
            { icon: '📊', title: 'Transparent', desc: 'Every action verifiable on-chain.' },
          ].map(item => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-5 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  {item.icon === '🔒' && <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}
                  {item.icon === '⚡' && <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>}
                  {item.icon === '🌐' && <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>}
                  {item.icon === '📊' && <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>}
                </svg>
              </div>
              <div className="font-semibold text-white mb-1">{item.title}</div>
              <p className="text-xs text-white/45">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section className="section" id="security">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm uppercase tracking-widest text-primary/80 mb-4 font-medium"
            >
              Security
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-heading-xl mb-6"
            >
              Built to protect<br />your commitments
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white/55 leading-relaxed mb-8"
            >
              Every line of the Pact smart contract is designed with security-first engineering.
              We protect against all major exploit vectors so your funds remain safe.
            </motion.p>
          </div>
          <div className="space-y-3">
            {[
              { check: 'Reentrancy Guards', detail: 'OpenZeppelin ReentrancyGuard on all fund movements' },
              { check: 'Ownership Validation', detail: 'Every function validates msg.sender against stored owner' },
              { check: 'SafeERC20 Transfers', detail: 'All ERC20 transfers use OpenZeppelin SafeERC20' },
              { check: 'Replay Protection', detail: 'Guardian approvals cannot be submitted twice' },
              { check: 'Integer Safety', detail: 'Solidity 0.8+ overflow protection throughout' },
              { check: 'Checks-Effects-Interactions', detail: 'State updated before external calls prevent reentrancy' },
            ].map((item, i) => (
              <motion.div
                key={item.check}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 p-4 glass-card"
              >
                <div className="mt-0.5 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{item.check}</div>
                  <div className="text-xs text-white/45 mt-0.5">{item.detail}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      quote: "I would have sold my MON during the correction. Pact stopped me. Six months later I'm up 340%.",
      name: 'Alex K.',
      role: 'DeFi Investor',
    },
    {
      quote: "My best friend is my guardian. Knowing she has to approve made me think three times before requesting release.",
      name: 'Priya M.',
      role: 'Product Designer',
    },
    {
      quote: "I've tried every savings app. Nothing worked until money was actually locked by code. Pact is the only thing that worked.",
      name: 'Marcus T.',
      role: 'Software Engineer',
    },
  ];

  return (
    <section className="section bg-[radial-gradient(ellipse_80%_30%_at_50%_50%,rgba(123,97,255,0.05)_0%,transparent_70%)]">
      <div className="container">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-heading-xl"
          >
            Future selves, <span className="gradient-text">grateful</span>
          </motion.h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <div className="text-2xl text-primary/60 mb-4">"</div>
              <p className="text-white/70 text-sm leading-relaxed mb-6 italic">{t.quote}</p>
              <div>
                <div className="text-sm font-semibold text-white">{t.name}</div>
                <div className="text-xs text-white/40">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const { status, connect } = useWallet();
  const router = useRouter();

  const handleCTA = () => {
    if (status === 'connected') router.push('/create');
    else connect().then(() => router.push('/create'));
  };

  return (
    <section className="section">
      <div className="container-sm text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl p-12 md:p-16 border border-primary/20 glow-purple relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(123,97,255,0.15)_0%,transparent_70%)]" />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 className="text-heading-xl mb-4">Ready to commit?</h2>
            <p className="text-white/55 mb-8 max-w-md mx-auto">
              Your future self is waiting. Make a promise they can't break.
            </p>
            <button onClick={handleCTA} className="btn btn-primary text-lg px-10 py-4 glow-purple">
              Create Your First Pact
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <CommitmentRules />
      <SecuritySection />
      <TestimonialsSection />
      <FAQ />
      <CTASection />
    </>
  );
}
