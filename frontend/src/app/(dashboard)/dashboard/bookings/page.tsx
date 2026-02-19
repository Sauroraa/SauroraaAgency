'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Filter, Download, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { BOOKING_STATUSES, COUNTRIES } from '@/lib/constants';
import type { Booking } from '@/types/booking';
import type { Artist } from '@/types/artist';
import { useToastStore } from '@/stores/toastStore';

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
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    artistId: '',
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    requesterCompany: '',
    eventName: '',
    eventDate: '',
    eventVenue: '',
    eventCity: '',
    eventCountry: 'BEL',
    eventType: 'festival',
    expectedAttendance: '',
    budgetMin: '',
    budgetMax: '',
    message: '',
    technicalRequirements: '',
    accommodationNeeded: false,
    travelNeeded: false,
  });

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

  const { data: artistsData } = useQuery({
    queryKey: ['booking-artists-select'],
    queryFn: async () => {
      const res = await api.get('/artists?limit=100');
      return res.data.data || res.data;
    },
  });
  const artists: Artist[] = artistsData?.items || [];

  const createBooking = useMutation({
    mutationFn: async () => {
      await api.post('/bookings', {
        ...form,
        expectedAttendance: form.expectedAttendance ? Number(form.expectedAttendance) : undefined,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      addToast('success', 'Booking créé avec succès');
      setShowCreate(false);
      setForm({
        artistId: '',
        requesterName: '',
        requesterEmail: '',
        requesterPhone: '',
        requesterCompany: '',
        eventName: '',
        eventDate: '',
        eventVenue: '',
        eventCity: '',
        eventCountry: 'BEL',
        eventType: 'festival',
        expectedAttendance: '',
        budgetMin: '',
        budgetMax: '',
        message: '',
        technicalRequirements: '',
        accommodationNeeded: false,
        travelNeeded: false,
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message;
      addToast('error', Array.isArray(message) ? message[0] : (message || 'Impossible de créer le booking'));
    },
  });

  const bookings: Booking[] = data?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Bookings</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Manage booking requests and pipeline</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setShowCreate((v) => !v)}>
          <Plus size={14} /> {showCreate ? 'Fermer' : 'Nouveau booking'}
        </Button>
      </div>

      {showCreate && (
        <Card>
          <h3 className="font-display font-semibold mb-4">Créer un booking</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Artiste *</label>
              <select
                value={form.artistId}
                onChange={(e) => setForm((prev) => ({ ...prev, artistId: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none"
              >
                <option value="">Sélectionner...</option>
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>{artist.name}</option>
                ))}
              </select>
            </div>
            <input className="px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" placeholder="Nom demandeur *" value={form.requesterName} onChange={(e) => setForm((prev) => ({ ...prev, requesterName: e.target.value }))} />
            <input className="px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" placeholder="Email demandeur *" value={form.requesterEmail} onChange={(e) => setForm((prev) => ({ ...prev, requesterEmail: e.target.value }))} />
            <input className="px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" placeholder="Téléphone" value={form.requesterPhone} onChange={(e) => setForm((prev) => ({ ...prev, requesterPhone: e.target.value }))} />
            <input className="px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" placeholder="Société" value={form.requesterCompany} onChange={(e) => setForm((prev) => ({ ...prev, requesterCompany: e.target.value }))} />
            <input className="px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none md:col-span-2" placeholder="Nom de l'événement *" value={form.eventName} onChange={(e) => setForm((prev) => ({ ...prev, eventName: e.target.value }))} />
            <input type="date" className="px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" value={form.eventDate} onChange={(e) => setForm((prev) => ({ ...prev, eventDate: e.target.value }))} />
            <input className="px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" placeholder="Lieu" value={form.eventVenue} onChange={(e) => setForm((prev) => ({ ...prev, eventVenue: e.target.value }))} />
            <input className="px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" placeholder="Ville *" value={form.eventCity} onChange={(e) => setForm((prev) => ({ ...prev, eventCity: e.target.value }))} />
            <select className="px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" value={form.eventCountry} onChange={(e) => setForm((prev) => ({ ...prev, eventCountry: e.target.value }))}>
              {Object.entries(COUNTRIES).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
            <select className="px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" value={form.eventType} onChange={(e) => setForm((prev) => ({ ...prev, eventType: e.target.value }))}>
              <option value="festival">Festival</option>
              <option value="club">Club</option>
              <option value="private">Privé</option>
              <option value="corporate">Corporate</option>
              <option value="other">Autre</option>
            </select>
            <input type="number" className="px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" placeholder="Audience estimée" value={form.expectedAttendance} onChange={(e) => setForm((prev) => ({ ...prev, expectedAttendance: e.target.value }))} />
            <input type="number" className="px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" placeholder="Budget min" value={form.budgetMin} onChange={(e) => setForm((prev) => ({ ...prev, budgetMin: e.target.value }))} />
            <input type="number" className="px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" placeholder="Budget max" value={form.budgetMax} onChange={(e) => setForm((prev) => ({ ...prev, budgetMax: e.target.value }))} />
            <textarea rows={3} className="md:col-span-2 px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" placeholder="Message" value={form.message} onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))} />
            <textarea rows={3} className="md:col-span-2 px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" placeholder="Exigences techniques" value={form.technicalRequirements} onChange={(e) => setForm((prev) => ({ ...prev, technicalRequirements: e.target.value }))} />
            <label className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <input type="checkbox" checked={form.accommodationNeeded} onChange={(e) => setForm((prev) => ({ ...prev, accommodationNeeded: e.target.checked }))} />
              Hébergement nécessaire
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <input type="checkbox" checked={form.travelNeeded} onChange={(e) => setForm((prev) => ({ ...prev, travelNeeded: e.target.checked }))} />
              Transport nécessaire
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              isLoading={createBooking.isPending}
              onClick={() => createBooking.mutate()}
              disabled={!form.artistId || !form.requesterName || !form.requesterEmail || !form.eventName || !form.eventDate || !form.eventCity}
            >
              Créer le booking
            </Button>
          </div>
        </Card>
      )}

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
