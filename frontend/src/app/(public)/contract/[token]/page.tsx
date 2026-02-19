'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ContractSignaturePage() {
  const { token } = useParams<{ token: string }>();
  const [signature, setSignature] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['contract-token', token],
    queryFn: async () => {
      const res = await publicApi.get(`/public/bookings/contracts/${token}`);
      return res.data.data || res.data;
    },
  });

  const signMutation = useMutation({
    mutationFn: async () => {
      const res = await publicApi.post(`/public/bookings/contracts/${token}/sign`, { signature });
      return res.data.data || res.data;
    },
  });

  const isAlreadySigned = useMemo(() => Boolean(data?.alreadySigned), [data?.alreadySigned]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-[var(--text-muted)]">Chargement du contrat...</div>;
  }

  if (isError || !data) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-red-400">Lien invalide ou expiré.</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <h1 className="font-display text-2xl font-bold mb-3">Signature du contrat</h1>
          <p className="text-sm text-[var(--text-muted)] mb-4">Référence: {data.referenceCode}</p>
          <div className="space-y-2 text-sm">
            <p><strong>Artiste:</strong> {data.artistName}</p>
            <p><strong>Evénement:</strong> {data.eventName}</p>
            <p><strong>Date:</strong> {new Date(data.eventDate).toLocaleDateString()}</p>
            <p><strong>Lieu:</strong> {data.eventCity}, {data.eventCountry}</p>
            {data.quotedAmount ? <p><strong>Montant:</strong> {data.quotedAmount} {data.budgetCurrency}</p> : null}
            {data.quotePdfUrl ? <p><a className="text-aurora-cyan underline" href={data.quotePdfUrl} target="_blank">Voir le PDF contrat/devis</a></p> : null}
          </div>
        </Card>

        <Card>
          {isAlreadySigned ? (
            <p className="text-emerald-400 text-sm">Ce contrat est déjà signé.</p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">Tape ton nom complet pour signer électroniquement.</p>
              <input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Nom et prénom"
                className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none"
              />
              <Button
                onClick={() => signMutation.mutate()}
                isLoading={signMutation.isPending}
                disabled={!signature.trim()}
              >
                Signer le contrat
              </Button>
              {signMutation.isSuccess ? <p className="text-emerald-400 text-sm">Contrat signé avec succès.</p> : null}
              {signMutation.isError ? <p className="text-red-400 text-sm">Impossible de signer. Le lien est peut-être expiré.</p> : null}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
