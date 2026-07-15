'use client';

import React from 'react';
import type { CommitmentScore } from '../../lib/types';
import ProgressRing from '../ui/ProgressRing';

interface DashboardStatsProps {
  score: CommitmentScore;
}

export default function DashboardStats({ score }: DashboardStatsProps) {
  const stats = [
    { label: 'Active Pacts', value: score.activePacts.toString(), svg: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></> },
    { label: 'Completed', value: score.completedPacts.toString(), svg: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></> },
    { label: 'Completion Rate', value: `${score.completionRate}%`, svg: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></> },
    { label: 'Total Locked', value: `${parseFloat(score.totalLocked).toFixed(3)} MON`, svg: <path d="M6 3h12l4 6-10 13L2 9Z" /> },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Commitment Score card */}
      <div className="col-span-2 glass-card p-6 flex items-center gap-6">
        <div className="relative">
          <ProgressRing
            progress={Math.min(100, score.score)}
            size={96}
            strokeWidth={6}
            color="#7B61FF"
          >
            <div className="text-center">
              <div className="text-xl font-bold text-white">{score.score}</div>
              <div className="text-[9px] text-white/40 uppercase tracking-wide">Score</div>
            </div>
          </ProgressRing>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-primary/70 mb-1 font-medium">Commitment Score</div>
          <div className="text-3xl font-bold text-white mb-1">{score.score}</div>
          <div className="text-sm text-white/40">{score.longestStreak} pact streak</div>
          <div className="text-sm text-white/40">{score.lifetimePacts} lifetime pacts</div>
        </div>
      </div>

      {stats.map(s => (
        <div key={s.label} className="glass-card p-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">{s.svg}</svg>
          </div>
          <div className="text-2xl font-bold text-white">{s.value}</div>
          <div className="text-xs text-white/40 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
