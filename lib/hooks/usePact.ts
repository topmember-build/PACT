'use client';

import { useCallback, useEffect, useState } from 'react';
import { getReadContract } from '../contract';
import { enrichPact } from '../pactUtils';
import type { PactData } from '../types';

export function usePact(pactId: string | null) {
  const [pact, setPact] = useState<PactData | null>(null);
  const [guardians, setGuardians] = useState<string[]>([]);
  const [guardianApprovalStatuses, setGuardianApprovalStatuses] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!pactId) { setPact(null); return; }
    setLoading(true);
    setError(null);
    try {
      const contract = getReadContract();
      const [raw, guardianList] = await Promise.all([
        contract.getPact(pactId),
        contract.getGuardians(pactId),
      ]);

      const enriched = enrichPact(pactId, {
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
      enriched.guardians = guardianList as string[];
      setPact(enriched);
      setGuardians(guardianList as string[]);

      // Fetch individual guardian approval statuses
      if ((guardianList as string[]).length > 0) {
        const statusEntries = await Promise.all(
          (guardianList as string[]).map(async (g) => {
            try {
              const approved: boolean = await contract.hasGuardianApproved(pactId, g);
              return [g, approved] as [string, boolean];
            } catch {
              return [g, false] as [string, boolean];
            }
          })
        );
        setGuardianApprovalStatuses(Object.fromEntries(statusEntries));
      } else {
        setGuardianApprovalStatuses({});
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load pact');
    } finally {
      setLoading(false);
    }
  }, [pactId]);

  useEffect(() => { load(); }, [load]);

  return { pact, guardians, guardianApprovalStatuses, loading, error, refetch: load };
}
