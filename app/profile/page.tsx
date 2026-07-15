'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useWallet } from '../../context/WalletContext';
import { usePacts } from '../../lib/hooks/usePacts';
import { computeCommitmentScore, computeAchievements, formatAddress, formatDate } from '../../lib/pactUtils';
import Badge from '../../components/ui/Badge';
import ProgressRing from '../../components/ui/ProgressRing';
import Link from 'next/link';

export default function ProfilePage() {
  const { address, status, connect, balance } = useWallet();
  const router = useRouter();
  const { pacts, loading } = usePacts(address);
  const score = useMemo(() => computeCommitmentScore(pacts), [pacts]);
  const achievements = useMemo(() => computeAchievements(pacts, score), [pacts, score]);

  if (status !== 'connected') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h1 className="text-heading-lg mb-4">Connect to view your Profile</h1>
          <p className="text-white/50 mb-8">Your commitment identity awaits.</p>
          <button onClick={connect} className="btn btn-primary" id="profile-connect-btn">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const earnedAchievements = achievements.filter(a => a.earned);
  const inProgressAchievements = achievements.filter(a => !a.earned);

  return (
    <div className="min-h-screen py-10">
      <div className="container max-w-4xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-8 mb-6 border border-white/[0.08] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(123,97,255,0.08)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center text-3xl font-bold text-white flex-shrink-0 border border-primary/20">
              {address ? address.slice(2, 4).toUpperCase() : '??'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white mb-1">
                {address ? formatAddress(address) : '-'}
              </h1>
              <p className="text-sm font-mono text-white/35 break-all">{address}</p>
              {balance && (
                <p className="text-sm text-white/50 mt-1">{balance} MON</p>
              )}
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{score.score}</div>
              <div className="text-xs text-white/40 uppercase tracking-wider mt-1">Commitment Score</div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
        >
          {[
            { label: 'Total Pacts', value: score.lifetimePacts, svg: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></> },
            { label: 'Fulfilled', value: score.completedPacts, svg: <><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></> },
            { label: 'Active', value: score.activePacts, svg: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></> },
            { label: 'Streak', value: score.longestStreak, svg: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/> },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 rounded-2xl text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">{stat.svg}</svg>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Completion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="glass-card p-6 rounded-2xl mb-6 flex items-center gap-6"
        >
          <ProgressRing progress={score.completionRate} size={80} strokeWidth={6}>
            <span className="text-sm font-bold text-white">{score.completionRate}%</span>
          </ProgressRing>
          <div>
            <div className="text-lg font-semibold text-white mb-1">Completion Rate</div>
            <p className="text-sm text-white/50">
              {score.completedPacts} of {score.lifetimePacts} pacts fulfilled.
              {score.brokenPacts > 0 && ` ${score.brokenPacts} broken.`}
            </p>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="glass-card p-6 rounded-2xl mb-6"
        >
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white/60 uppercase tracking-widest mb-5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
            Achievements
          </h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {earnedAchievements.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs text-white/35 mb-3">Earned</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {earnedAchievements.map(a => (
                      <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {a.id === 'first-pact' && <><path d="M12 22c4.97-4.97 7-9.67 7-13.5a7 7 0 1 0-14 0c0 3.83 2.03 8.53 7 13.5z"/><circle cx="12" cy="8.5" r="2"/></>}
                            {a.id === 'iron-will' && <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>}
                            {a.id === 'diamond-hands' && <path d="M6 3h12l4 6-10 13L2 9Z" />}
                            {a.id === 'guardian-protected' && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}
                            {a.id === '100-day-commitment' && <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}
                            {a.id === 'completion-master' && <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />}
                            {a.id === 'seven-day-discipline' && <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>}
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{a.name}</div>
                          <div className="text-xs text-white/50">{a.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inProgressAchievements.length > 0 && (
                <div>
                  <p className="text-xs text-white/35 mb-3">In Progress</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {inProgressAchievements.map(a => (
                      <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 flex-shrink-0">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {a.id === 'first-pact' && <><path d="M12 22c4.97-4.97 7-9.67 7-13.5a7 7 0 1 0-14 0c0 3.83 2.03 8.53 7 13.5z"/><circle cx="12" cy="8.5" r="2"/></>}
                            {a.id === 'iron-will' && <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>}
                            {a.id === 'diamond-hands' && <path d="M6 3h12l4 6-10 13L2 9Z" />}
                            {a.id === 'guardian-protected' && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}
                            {a.id === '100-day-commitment' && <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}
                            {a.id === 'completion-master' && <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />}
                            {a.id === 'seven-day-discipline' && <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>}
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white/50">{a.name}</div>
                          <div className="text-xs text-white/30">{a.description}</div>
                          {a.progress !== undefined && (
                            <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary/40 rounded-full"
                                style={{ width: `${a.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pacts.length === 0 && (
                <p className="text-white/35 text-sm text-center py-6">
                  Create your first pact to start earning achievements.
                </p>
              )}
            </>
          )}
        </motion.div>

        {/* Recent pacts shortcut */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3"
        >
          <Link href="/dashboard" className="btn btn-ghost flex-1 justify-center" id="profile-dashboard-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> View All Pacts
          </Link>
          <Link href="/create" className="btn btn-primary flex-1 justify-center" id="profile-create-link">
            + Create Pact
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
