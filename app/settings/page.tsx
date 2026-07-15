'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useWallet } from '../../context/WalletContext';
import { useToast } from '../../context/ToastContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useTheme } from 'next-themes';
import { formatAddress } from '../../lib/pactUtils';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
  disabled?: boolean;
}

function Toggle({ checked, onChange, id, disabled }: ToggleProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 border focus-visible:outline-2 focus-visible:outline-primary ${
        checked
          ? 'bg-primary border-primary'
          : 'bg-white/10 border-white/15'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  comingSoon?: boolean;
}

function SettingRow({ label, description, children, comingSoon }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-white/[0.05] last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white">{label}</div>
        {description && <div className="text-xs text-white/40 mt-0.5">{description}</div>}
      </div>
      <div className="flex-shrink-0">
        {comingSoon ? (
          <span className="text-xs text-white/25 italic bg-white/5 px-2.5 py-1 rounded-full">Coming soon</span>
        ) : children}
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  delay?: number;
}

function Section({ title, icon, children, delay = 0 }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-6 rounded-2xl"
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">
        <span>{icon}</span>
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

export default function SettingsPage() {
  const { address, status, connect, disconnect, switchNetwork, chainId } = useWallet();
  const { toast } = useToast();
  const { prefs, setPref } = usePreferences();
  const { theme, setTheme } = useTheme();

  function copyAddress() {
    if (!address) return;
    navigator.clipboard?.writeText(address);
    toast('success', 'Copied!', 'Your address has been copied to clipboard.');
  }

  if (status !== 'connected') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6 animate-float">⚙️</div>
          <h1 className="text-heading-lg mb-4">Connect to view Settings</h1>
          <p className="text-white/50 mb-8">Manage your preferences and wallet.</p>
          <button onClick={connect} className="btn btn-primary" id="settings-connect-btn">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-heading-lg">Settings</h1>
          <p className="text-white/40 text-sm mt-1">Preferences, wallet, and security options.</p>
        </motion.div>

        <div className="space-y-4">

          {/* ── Wallet ──────────────────────────────────────────── */}
          <Section title="Wallet" icon="🔗" delay={0.05}>
            <SettingRow label="Connected Address" description="Your currently connected wallet">
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 text-sm font-mono text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/8"
                id="copy-address-btn"
              >
                <span>{formatAddress(address || '')}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              </button>
            </SettingRow>

            <SettingRow label="Network" description="Monad Testnet is required for Pact">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${chainId === 31337 || chainId === 10143 ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm text-white/70">
                  {chainId === 31337 ? 'Local Node' : chainId === 10143 ? 'Monad Testnet' : `Chain ${chainId}`}
                </span>
              </div>
            </SettingRow>

            {chainId !== 31337 && chainId !== 10143 && (
              <div className="mt-3">
                <button
                  onClick={switchNetwork}
                  className="btn btn-secondary w-full text-sm"
                  id="switch-network-btn"
                >
                  Switch to Monad Testnet
                </button>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-white/[0.05]">
              <button
                onClick={disconnect}
                className="btn btn-danger w-full text-sm"
                id="disconnect-wallet-btn"
              >
                Disconnect Wallet
              </button>
            </div>
          </Section>

          {/* ── Display ─────────────────────────────────────────── */}
          <Section title="Display" icon="🎨" delay={0.1}>
            <SettingRow
              label="Theme"
              description="Interface color scheme"
            >
              <Toggle
                id="toggle-theme"
                checked={theme === 'dark'}
                onChange={v => setTheme(v ? 'dark' : 'light')}
              />
            </SettingRow>

            <SettingRow
              label="Show Countdown Seconds"
              description="Display seconds in time-lock countdowns"
            >
              <Toggle
                id="toggle-countdown-seconds"
                checked={prefs.showCountdownSeconds}
                onChange={v => setPref('showCountdownSeconds', v)}
              />
            </SettingRow>

            <SettingRow
              label="Compact Pact Cards"
              description="Use smaller cards in dashboard grid"
            >
              <Toggle
                id="toggle-compact-cards"
                checked={prefs.compactCards}
                onChange={v => setPref('compactCards', v)}
              />
            </SettingRow>

            <SettingRow
              label="Sound Effects"
              description="Play audio feedback on key actions"
            >
              <Toggle
                id="toggle-sound-effects"
                checked={prefs.soundEffects}
                onChange={v => setPref('soundEffects', v)}
              />
            </SettingRow>
          </Section>

          {/* ── Security ────────────────────────────────────────── */}
          <Section title="Security" icon="🔐" delay={0.15}>
            <SettingRow
              label="Confirm Before Release"
              description="Show confirmation dialog before releasing funds"
            >
              <Toggle
                id="toggle-confirm-release"
                checked={prefs.confirmBeforeRelease}
                onChange={v => setPref('confirmBeforeRelease', v)}
              />
            </SettingRow>

            <SettingRow
              label="Show Testnet Warning"
              description="Display a warning banner on testnet"
            >
              <Toggle
                id="toggle-testnet-warning"
                checked={prefs.showTestnetWarning}
                onChange={v => setPref('showTestnetWarning', v)}
              />
            </SettingRow>
          </Section>

          {/* ── Notifications ───────────────────────────────────── */}
          <Section title="Notifications" icon="🔔" delay={0.2}>
            <SettingRow
              label="Guardian Email Alerts"
              description="Notify guardians by email when approval is needed"
              comingSoon
            >
              <span />
            </SettingRow>

            <SettingRow
              label="Release Ready Alerts"
              description="Get notified when a pact's time lock expires"
              comingSoon
            >
              <span />
            </SettingRow>

            <SettingRow
              label="Weekly Digest"
              description="Summary email of your commitment portfolio"
              comingSoon
            >
              <span />
            </SettingRow>
          </Section>

          {/* ── About ───────────────────────────────────────────── */}
          <Section title="About" icon="ℹ️" delay={0.25}>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Version', value: '1.0.0-mvp' },
                { label: 'Network', value: 'Monad' },
                { label: 'License', value: 'MIT' },
              ].map(r => (
                <div key={r.label} className="flex justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <span className="text-white/40">{r.label}</span>
                  <span className="text-white/70">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-white/[0.05] flex gap-3">
              <Link href="/dashboard" className="btn btn-ghost flex-1 text-sm justify-center">
                Dashboard
              </Link>
              <Link href="/" className="btn btn-ghost flex-1 text-sm justify-center">
                Home
              </Link>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}
