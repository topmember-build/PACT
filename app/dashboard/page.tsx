'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useWallet } from '../../context/WalletContext';
import { usePacts } from '../../lib/hooks/usePacts';
import { computeCommitmentScore } from '../../lib/pactUtils';
import DashboardStats from '../../components/dashboard/DashboardStats';
import PactCard from '../../components/dashboard/PactCard';
import EmptyState from '../../components/ui/EmptyState';
import type { PactStatus } from '../../lib/types';

type FilterStatus = 'All' | PactStatus;

const FILTERS: FilterStatus[] = ['All', 'Active', 'Fulfilled', 'Broken', 'Canceled'];

export default function DashboardPage() {
  const { address, status, connect } = useWallet();
  const router = useRouter();
  const { pacts, loading, error, refetch } = usePacts(address);
  const [filter, setFilter] = useState<FilterStatus>('All');
  const [search, setSearch] = useState('');

  const score = useMemo(() => computeCommitmentScore(pacts), [pacts]);

  const filtered = useMemo(() => {
    return pacts.filter(p => {
      const matchesFilter = filter === 'All' || p.status === filter;
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.tokenSymbol.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [pacts, filter, search]);

  if (status !== 'connected') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 className="text-heading-lg mb-4">Connect to view your Dashboard</h1>
          <p className="text-white/50 mb-8">Your commitment headquarters awaits.</p>
          <button onClick={connect} className="btn btn-primary" id="dashboard-connect-btn">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-heading-lg"
            >
              Your Commitments
            </motion.h1>
            <p className="text-white/40 text-sm mt-1">
              {pacts.length} pact{pacts.length !== 1 ? 's' : ''} • {score.activePacts} active
            </p>
          </div>
          <button
            onClick={() => router.push('/create')}
            className="btn btn-primary"
            id="dashboard-create-btn"
          >
            + Create Pact
          </button>
        </div>

        {/* Stats */}
        {pacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <DashboardStats score={score} />
          </motion.div>
        )}

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search pacts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-base pl-10"
              aria-label="Search pacts"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm transition-all border ${
                  filter === f
                    ? 'bg-primary/20 border-primary/40 text-white'
                    : 'border-white/10 text-white/50 hover:text-white hover:border-white/20'
                }`}
                aria-pressed={filter === f}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="glass-card p-6 border-red-500/20 text-center">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button onClick={refetch} className="btn btn-ghost text-sm">Retry</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon={pacts.length === 0 ? undefined : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>}
            title={pacts.length === 0 ? 'No pacts yet' : 'No matching pacts'}
            description={
              pacts.length === 0
                ? 'Create your first pact and start building the discipline your future self will thank you for.'
                : 'Try adjusting your search or filter.'
            }
            action={
              pacts.length === 0
                ? { label: 'Create Your First Pact', onClick: () => router.push('/create') }
                : { label: 'Clear Search', onClick: () => { setSearch(''); setFilter('All'); } }
            }
          />
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((pact, i) => (
              <motion.div
                key={pact.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <PactCard pact={pact} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
