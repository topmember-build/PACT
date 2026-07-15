'use client';

import { useCallback, useEffect, useState } from 'react';
import { getReadContract, getSignerAndContract } from '../contract';
import { enrichPact } from '../pactUtils';
import type { PactData } from '../types';

export function usePacts(address: string | null) {
  const [pacts, setPacts] = useState<PactData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!address) { setPacts([]); return; }
    setLoading(true);
    setError(null);
    try {
      const contract = getReadContract();
      const ids: bigint[] = await contract.getUserPacts(address);
      const pactPromises = ids.map(async (id) => {
        const raw = await contract.getPact(id);
        return enrichPact(id.toString(), {
          owner: raw.owner,
          token: raw.token,
          amount: raw.amount,
          ruleType: Number(raw.ruleType),
          ruleParams: raw.ruleParams,
          name: raw.name,
          message: raw.message,
          createdAt: raw.createdAt,
          releaseRequestedAt: raw.releaseRequestedAt,
          guardianThreshold: Number(raw.guardianThreshold),
          guardianApprovalCount: Number(raw.guardianApprovalCount),
          status: Number(raw.status),
        });
      });
      const results = await Promise.all(pactPromises);
      setPacts(results.reverse()); // newest first
    } catch (e: any) {
      setError(e?.message || 'Failed to load pacts');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => { load(); }, [load]);

  return { pacts, loading, error, refetch: load };
}
