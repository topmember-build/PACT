'use client';

import React from 'react';
import type { PactStatus } from '../../lib/types';

type BadgeVariant = 'status' | 'rule' | 'token' | 'default';

interface BadgeProps {
  label: string;
  status?: PactStatus;
  variant?: BadgeVariant;
  className?: string;
}

const statusClasses: Record<PactStatus, string> = {
  Active:    'bg-green-500/15 text-green-400 border-green-500/20',
  Fulfilled: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
  Broken:    'bg-red-500/15 text-red-400 border-red-500/20',
  Canceled:  'bg-white/8 text-white/40 border-white/10',
};

export default function Badge({ label, status, variant = 'default', className = '' }: BadgeProps) {
  const base = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border';

  if (status) {
    return (
      <span className={`${base} ${statusClasses[status]} ${className}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${
          status === 'Active' ? 'bg-green-400' :
          status === 'Fulfilled' ? 'bg-purple-400' :
          status === 'Broken' ? 'bg-red-400' : 'bg-white/30'
        }`} />
        {label}
      </span>
    );
  }

  return (
    <span className={`${base} bg-white/6 text-white/70 border-white/10 ${className}`}>
      {label}
    </span>
  );
}
