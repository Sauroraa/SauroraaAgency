'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { FileText, PenSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/authStore';
import type { Booking } from '@/types/booking';

const contractStatuses = ['quoted', 'negotiating', 'confirmed'];

export default function ContractsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'admin' || role === 'manager';

  const { data, isLoading } = useQuery({
    queryKey: ['contracts-list', role],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('limit', '100');
      const res = await api.get(`/bookings?${params.toString()}`);
      const payload = res.data.data || res.data;
      const all: Booking[] = payload.items || [];
      return all.filter((b) => contractStatuses.includes(b.status));
    },
  });

  const rows = data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Contrats</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {isAdmin ? 'Liste complete de tous les contrats (signes ou non)' : 'Mes contrats a completer et signer'}
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : rows.length ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-dark-800/30">
                <th className="text-left py-3 px-4">Reference</th>
                <th className="text-left py-3 px-4">Artiste</th>
                <th className="text-left py-3 px-4">Organisateur</th>
                <th className="text-left py-3 px-4">Evenement</th>
                <th className="text-left py-3 px-4">Statut contrat</th>
                <th className="text-left py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((booking) => (
                <tr key={booking.id} className="border-b border-[var(--border-color)]">
                  <td className="py-3 px-4 font-mono text-aurora-cyan">{booking.referenceCode}</td>
                  <td className="py-3 px-4">{booking.artist?.name || 'N/A'}</td>
                  <td className="py-3 px-4">{booking.requesterName}</td>
                  <td className="py-3 px-4">{booking.eventName}</td>
                  <td className="py-3 px-4">
                    {booking.signedAt ? (
                      <Badge variant="success">Signe</Badge>
                    ) : (
                      <Badge variant="warning">Non signe</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/dashboard/contracts/${booking.id}`}
                      className="inline-flex items-center gap-1.5 text-aurora-cyan hover:underline"
                    >
                      <PenSquare size={14} /> Ouvrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-[var(--text-muted)]">
            <div className="inline-flex items-center gap-2">
              <FileText size={16} /> Aucun contrat pour le moment
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
