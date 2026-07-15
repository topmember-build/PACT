'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from '../../context/WalletContext';

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.12 } } },
  item: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as any } },
  },
};

// Trust signal icons — inline SVG, no emoji
const TRUST_SIGNALS = [
  {
    label: 'Immutable Commitments',
    svg: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  },
  {
    label: 'Monad-Native Speed',
    svg: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>,
  },
  {
    label: 'Guardian Protected',
    svg: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
  },
  {
    label: 'Non-Custodial',
    svg: <><path d="M20 6L9 17l-5-5" /></>,
  },
];

export default function Hero() {
  const { status, connect } = useWallet();
  const router = useRouter();
  const isConnected = status === 'connected';

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  const handleCTA = () => {
    if (isConnected) router.push('/create');
    else connect().then(() => router.push('/create'));
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden" id="hero">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(123,97,255,0.12)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-grid opacity-50" />

      <motion.div style={{ y, opacity }} className="container relative z-10 py-24 lg:py-36">
        <motion.div
          variants={stagger.container}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Logo */}
          <motion.div variants={stagger.item} className="flex justify-center mb-12">
            <div className="relative">
              <img
                src="/assets/pact-logo.jpg"
                alt="Pact"
                className="w-40 h-40 object-contain rounded-3xl animate-float"
                style={{ filter: 'drop-shadow(0 0 40px rgba(123,97,255,0.5))' }}
              />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={stagger.item} className="text-display glow-text mb-6">
            Make promises your<br />future self can't break.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={stagger.item}
            className="text-lg md:text-xl text-white/60 leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Pact transforms personal discipline into programmable commitments enforced onchain.
            Lock in your intentions. Protect them with smart contracts. Fulfill your potential.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={stagger.item} className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleCTA}
              className="btn btn-primary text-base px-8 py-4 glow-purple-sm"
              id="hero-cta-primary"
            >
              Create Your First Pact
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <a
              href="#how-it-works"
              className="btn btn-ghost text-base px-8 py-4"
              id="hero-cta-secondary"
            >
              How It Works
            </a>
          </motion.div>

          {/* Trust signals — SVG icons only */}
          <motion.div
            variants={stagger.item}
            className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-white/35"
          >
            {TRUST_SIGNALS.map(item => (
              <span key={item.label} className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/60">
                  {item.svg}
                </svg>
                {item.label}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050517] to-transparent pointer-events-none" />
    </section>
  );
}
