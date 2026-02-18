'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Filter, Download } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { BOOKING_STATUSES, COUNTRIES } from '@/lib/constants';
import type { Booking } from '@/types/booking';

function getStatusBadge(status: string) {
  const s = BOOKING_STATUSES.find((b) => b.value === status);
  const variant = status === 'confirmed' ? 'success' : status === 'declined' || status === 'cancelled' ? 'danger' : status === 'new' ? 'info' : 'warning';
  return <Badge variant={variant}>{s?.label || status}</Badge>;
}

function getScoreColor(score: number | null) {
  if (!score) return 'text-[var(--text-muted)]';
  if (score >= 70) return 'text-emerald-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const router = useRouter();

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    const res = await api.get(`/bookings/export${params.toString() ? `?${params}` : ''}`, { responseType: 'blob' });
    const blobUrl = window.URL.createObjectURL(new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }));
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(blobUrl);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', '50');
      const res = await api.get(`/bookings?${params}`);
      return res.data.data || res.data;
    },
  });

  const bookings: Booking[] = data?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Bookings</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Manage booking requests and pipeline</p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={16} className="text-[var(--text-muted)]" />
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              !statusFilter ? 'bg-aurora-cyan/15 border-aurora-cyan/30 text-aurora-cyan' : 'border-[var(--border-color)] text-[var(--text-muted)]'
            }`}
          >
            All
          </button>
          {BOOKING_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value === statusFilter ? '' : s.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                statusFilter === s.value ? 'bg-aurora-cyan/15 border-aurora-cyan/30 text-aurora-cyan' : 'border-[var(--border-color)] text-[var(--text-muted)]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-aurora-cyan hover:border-aurora-cyan/30 transition-colors"
        >
          <Download size={14} /> Export Excel
        </button>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : bookings.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-dark-800/30">
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Reference</th>
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Artist</th>
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Event</th>
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Date</th>
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Country</th>
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Status</th>
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                  className="border-b border-[var(--border-color)] hover:bg-dark-800/30 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-6 font-mono text-aurora-cyan">{booking.referenceCode}</td>
                  <td className="py-3 px-6">{booking.artist?.name || 'N/A'}</td>
                  <td className="py-3 px-6">{booking.eventName}</td>
                  <td className="py-3 px-6 text-[var(--text-secondary)]">{new Date(booking.eventDate).toLocaleDateString()}</td>
                  <td className="py-3 px-6 text-[var(--text-secondary)]">{COUNTRIES[booking.eventCountry] || booking.eventCountry}</td>
                  <td className="py-3 px-6">{getStatusBadge(booking.status)}</td>
                  <td className={`py-3 px-6 font-mono font-bold ${getScoreColor(booking.score)}`}>
                    {booking.score || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-[var(--text-muted)]">No bookings found</div>
        )}
      </Card>
    </div>
  );
}
