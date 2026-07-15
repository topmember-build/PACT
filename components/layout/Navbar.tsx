'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useWallet } from '../../context/WalletContext';
import { usePreferences } from '../../context/PreferencesContext';
import { formatAddress } from '../../lib/pactUtils';
import { useTranslation, LANGUAGES } from '../../context/TranslationContext';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/create', label: 'Create Pact' },
  { href: '/profile', label: 'Profile' },
  { href: '/docs', label: 'Docs' },
];

export default function Navbar() {
  const { address, status, connect, disconnect, switchNetwork, chainId } = useWallet();
  const { prefs } = usePreferences();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { currentLang, changeLanguage } = useTranslation();

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  const isConnected = status === 'connected';

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      {isConnected && prefs.showTestnetWarning && (chainId === 10143 || chainId === 31337) && (
        <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs py-1.5 text-center font-medium border-b border-yellow-500/20">
          You are connected to {chainId === 10143 ? 'Monad Testnet' : 'a Local Node'}. Funds are not real.
        </div>
      )}
      <div className={`transition-colors duration-300 ${scrolled ? 'glass border-b border-white/[0.06]' : 'bg-transparent border-b border-transparent'}`}>
        <div className="container flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0" aria-label="Pact home">
            <img
              src="/assets/pact-logo.jpg"
              alt="Pact"
              className="h-10 w-auto rounded-lg object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {isConnected && NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${pathname === link.href
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/60 hover:text-white hover:bg-white/6'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLanguageOpen(o => !o)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                aria-label="Select Language"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <span className="text-xs font-medium uppercase tracking-wider">{currentLang}</span>
              </button>

              <AnimatePresence>
                {languageOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-2 w-40 glass-strong rounded-xl overflow-hidden border border-white/10 z-50 shadow-xl"
                  >
                    <div className="py-1">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            changeLanguage(lang.code);
                            setLanguageOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                            currentLang === lang.code
                              ? 'bg-primary/20 text-white font-medium'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span>{lang.nativeName}</span>
                          <span className="text-[10px] text-white/40 uppercase">{lang.code}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {status === 'wrong-network' && (
              <button
                onClick={() => switchNetwork?.()}
                className="hidden sm:flex btn btn-danger text-sm px-4 py-2"
              >
                Wrong Network
              </button>
            )}

            {!isConnected && status !== 'connecting' && (
              <button
                onClick={connect}
                className="btn btn-primary text-sm px-5 py-2.5"
                id="connect-wallet-btn"
              >
                Connect Wallet
              </button>
            )}

            {status === 'connecting' && (
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Connecting…
              </div>
            )}

            {isConnected && address && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="flex items-center gap-2.5 px-4 py-2 glass-strong rounded-full text-sm font-medium hover:border-white/20 transition-all"
                  id="wallet-address-btn"
                  aria-expanded={dropdownOpen}
                >
                  <div className="w-2 h-2 rounded-full bg-green-400 glow-purple-sm" />
                  <span className="text-white/90">{formatAddress(address)}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full mt-2 w-48 glass-strong rounded-xl overflow-hidden border border-white/10"
                    >
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-white/80 hover:bg-white/8 hover:text-white transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-white/80 hover:bg-white/8 hover:text-white transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-white/80 hover:bg-white/8 hover:text-white transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> Settings
                      </Link>
                      <div className="border-t border-white/8 mx-3" />
                      <button
                        onClick={() => { disconnect(); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg> Disconnect
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-colors"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen
                  ? <path d="M18 6L6 18M6 6l12 12" />
                  : <path d="M3 12h18M3 6h18M3 18h18" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-white/[0.06]"
              aria-label="Mobile navigation"
            >
              <div className="container py-3 flex flex-col gap-1">
                {isConnected && NAV_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-3 rounded-xl text-sm transition-colors ${pathname === link.href ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
                      }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {!isConnected && (
                  <button
                    onClick={() => { connect(); setMobileOpen(false); }}
                    className="btn btn-primary mt-2"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
