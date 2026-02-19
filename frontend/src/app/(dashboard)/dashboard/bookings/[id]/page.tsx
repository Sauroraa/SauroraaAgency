'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Clock, MapPin, Users as UsersIcon, DollarSign, FileSignature } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToastStore } from '@/stores/toastStore';
import { BOOKING_STATUSES, COUNTRIES } from '@/lib/constants';
import type { Booking } from '@/types/booking';

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [comment, setComment] = useState('');
  const [quotedAmount, setQuotedAmount] = useState('');
  const [quotePdfUrl, setQuotePdfUrl] = useState('');
  const [contractMessage, setContractMessage] = useState('');

  const { data: booking, isLoading } = useQuery<Booking>({
    queryKey: ['booking', id],
    queryFn: async () => {
      const res = await api.get(`/bookings/${id}`);
      return res.data.data || res.data;
    },
  });

  const { data: similarArtists } = useQuery({
    queryKey: ['similar-artists', booking?.artistId],
    enabled: Boolean(booking?.artistId),
    queryFn: async () => {
      const res = await api.get(`/artists/${booking?.artistId}/similar`);
      return res.data.data || res.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      await api.patch(`/bookings/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      addToast('success', 'Status updated');
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/bookings/${id}/comments`, { content: comment, isInternal: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      setComment('');
      addToast('success', 'Comment added');
    },
  });

  const sendContractMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/bookings/${id}/send-contract`, {
        quotedAmount: quotedAmount ? Number(quotedAmount) : undefined,
        quotePdfUrl: quotePdfUrl || undefined,
        customMessage: contractMessage || undefined,
      });
      return res.data.data || res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      if (data?.signingUrl && typeof window !== 'undefined') {
        navigator.clipboard?.writeText(data.signingUrl).catch(() => undefined);
      }
      addToast('success', 'Contrat envoyé. Lien de signature copié.');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message;
      addToast('error', Array.isArray(message) ? message[0] : (message || 'Impossible d’envoyer le contrat'));
    },
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-96" /></div>;
  if (!booking) return <div>Booking not found</div>;
  const statusHistory = booking.statusHistory ?? [];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-2xl font-bold font-mono">{booking.referenceCode}</h1>
            <Badge variant={booking.status === 'confirmed' ? 'success' : booking.status === 'declined' ? 'danger' : 'info'}>
              {BOOKING_STATUSES.find((s) => s.value === booking.status)?.label || booking.status}
            </Badge>
          </div>
          <p className="text-sm text-[var(--text-muted)]">{booking.eventName} — {booking.artist?.name || 'N/A'}</p>
        </div>
        {booking.score !== null && (
          <div className="text-right">
            <p className="text-xs text-[var(--text-muted)]">Score</p>
            <p className="font-display text-3xl font-bold text-aurora-cyan">{booking.score}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="font-display font-semibold mb-4">Event Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2"><Clock size={14} className="text-[var(--text-muted)]" /> {new Date(booking.eventDate).toLocaleDateString()}</div>
              <div className="flex items-center gap-2"><MapPin size={14} className="text-[var(--text-muted)]" /> {booking.eventCity}, {COUNTRIES[booking.eventCountry] || booking.eventCountry}</div>
              <div className="flex items-center gap-2"><UsersIcon size={14} className="text-[var(--text-muted)]" /> {booking.expectedAttendance || 'N/A'} expected</div>
              <div className="flex items-center gap-2"><DollarSign size={14} className="text-[var(--text-muted)]" /> {booking.budgetMin && booking.budgetMax ? `${booking.budgetMin} - ${booking.budgetMax} ${booking.budgetCurrency}` : 'N/A'}</div>
            </div>
            {booking.message && (
              <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-muted)] mb-1">Message</p>
                <p className="text-sm text-[var(--text-secondary)]">{booking.message}</p>
              </div>
            )}
          </Card>

          {/* Comments */}
          <Card>
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <MessageSquare size={16} /> Comments
            </h3>
            <div className="space-y-4 mb-6">
              {booking.comments?.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-aurora-cyan/20 flex items-center justify-center text-xs font-bold shrink-0">
                    {c.user?.firstName?.[0]}{c.user?.lastName?.[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{c.user?.firstName} {c.user?.lastName}</p>
                      <span className="text-xs text-[var(--text-muted)]">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{c.content}</p>
                  </div>
                </div>
              ))}
              {!booking.comments?.length && (
                <p className="text-sm text-[var(--text-muted)]">No comments yet</p>
              )}
            </div>
            <div className="flex gap-3">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none focus:border-aurora-cyan/50"
              />
              <Button
                size="sm"
                onClick={() => commentMutation.mutate()}
                disabled={!comment.trim()}
                isLoading={commentMutation.isPending}
              >
                <Send size={14} />
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-display font-semibold mb-4">Update Status</h3>
            <div className="flex flex-wrap gap-2">
              {BOOKING_STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => statusMutation.mutate(s.value)}
                  disabled={booking.status === s.value}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    booking.status === s.value
                      ? 'bg-aurora-cyan/15 border-aurora-cyan/30 text-aurora-cyan'
                      : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-display font-semibold mb-4">Requester</h3>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-[var(--text-muted)]">Name</dt><dd>{booking.requesterName}</dd></div>
              <div><dt className="text-[var(--text-muted)]">Email</dt><dd className="text-aurora-cyan">{booking.requesterEmail}</dd></div>
              {booking.requesterPhone && <div><dt className="text-[var(--text-muted)]">Phone</dt><dd>{booking.requesterPhone}</dd></div>}
              {booking.requesterCompany && <div><dt className="text-[var(--text-muted)]">Company</dt><dd>{booking.requesterCompany}</dd></div>}
            </dl>
          </Card>

          <Card>
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <FileSignature size={16} /> Contrat & Signature
            </h3>
            <div className="space-y-3">
              <input
                type="number"
                value={quotedAmount}
                onChange={(e) => setQuotedAmount(e.target.value)}
                placeholder="Montant du devis (EUR)"
                className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none"
              />
              <input
                value={quotePdfUrl}
                onChange={(e) => setQuotePdfUrl(e.target.value)}
                placeholder="URL PDF contrat/devis (optionnel)"
                className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none"
              />
              <textarea
                rows={3}
                value={contractMessage}
                onChange={(e) => setContractMessage(e.target.value)}
                placeholder="Message personnalisé (optionnel)"
                className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none resize-none"
              />
              <Button
                onClick={() => sendContractMutation.mutate()}
                isLoading={sendContractMutation.isPending}
              >
                Envoyer le contrat à signer
              </Button>
              {booking.signedAt && (
                <p className="text-xs text-emerald-400">Signé le {new Date(booking.signedAt).toLocaleString()}</p>
              )}
            </div>
          </Card>

          {statusHistory.length > 0 && (
            <Card>
              <h3 className="font-display font-semibold mb-4">History</h3>
              <div className="space-y-3">
                {statusHistory.map((h) => (
                  <div key={h.id} className="flex items-start gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-aurora-cyan mt-1.5 shrink-0" />
                    <div>
                      <p>{h.fromStatus ? `${h.fromStatus} → ` : ''}<span className="font-medium">{h.toStatus}</span></p>
                      <p className="text-[var(--text-muted)]">{new Date(h.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {!!similarArtists?.length && (
            <Card>
              <h3 className="font-display font-semibold mb-4">Similar Artists</h3>
              <div className="space-y-2">
                {similarArtists.slice(0, 5).map((artist: any) => (
                  <div key={artist.id} className="flex items-center justify-between text-sm">
                    <span>{artist.name}</span>
                    <span className="text-xs text-[var(--text-muted)]">{artist.country}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
