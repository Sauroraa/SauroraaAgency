'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, PenSquare, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import type { Booking } from '@/types/booking';
import type { Artist } from '@/types/artist';

export default function ContractsPage() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'admin';
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    organizerUserId: '',
    requesterName: '',
    requesterEmail: '',
    artistId: '',
    eventName: '',
    eventDate: '',
    eventVenue: '',
    eventCity: '',
    eventCountry: 'BEL',
    eventType: 'festival',
    budgetMin: '',
    budgetMax: '',
    quotedAmount: '',
    message: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['contracts-list', role],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('limit', '100');
      const res = await api.get(`/bookings?${params.toString()}`);
      const payload = res.data.data || res.data;
      return (payload.items || []) as Booking[];
    },
  });

  const { data: artistsData } = useQuery({
    queryKey: ['contracts-artists-select'],
    enabled: isAdmin,
    queryFn: async () => {
      const res = await api.get('/artists?limit=200');
      const payload = res.data.data || res.data;
      return (payload.items || []) as Artist[];
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ['contracts-users-select'],
    enabled: isAdmin,
    queryFn: async () => {
      const res = await api.get('/users?limit=300');
      const payload = res.data.data || res.data;
      const items = payload.items || [];
      return items.filter((u: any) => u.role === 'organizer' || u.role === 'promoter');
    },
  });

  const createContract = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
        quotedAmount: form.quotedAmount ? Number(form.quotedAmount) : undefined,
      };
      const res = await api.post('/bookings/contracts/direct', payload);
      return res.data.data || res.data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['contracts-list'] });
      setShowCreate(false);
      setForm({
        organizerUserId: '',
        requesterName: '',
        requesterEmail: '',
        artistId: '',
        eventName: '',
        eventDate: '',
        eventVenue: '',
        eventCity: '',
        eventCountry: 'BEL',
        eventType: 'festival',
        budgetMin: '',
        budgetMax: '',
        quotedAmount: '',
        message: '',
      });
      if (data?.signingUrl && typeof window !== 'undefined') {
        navigator.clipboard?.writeText(data.signingUrl).catch(() => undefined);
      }
      addToast('success', 'Contrat créé et lien de signature généré');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message;
      addToast('error', Array.isArray(message) ? message[0] : (message || 'Création du contrat impossible'));
    },
  });

  const rows = data || [];
  const artists = artistsData || [];
  const users = usersData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
        <h1 className="font-display text-2xl font-bold">Contrats</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {isAdmin ? 'Liste complete de tous les contrats (signes ou non)' : 'Mes contrats a completer et signer'}
        </p>
        </div>
        {isAdmin ? (
          <Button onClick={() => setShowCreate((v) => !v)}>
            <Plus size={14} /> {showCreate ? 'Fermer' : 'Nouveau contrat'}
          </Button>
        ) : null}
      </div>

      {isAdmin && showCreate ? (
        <Card>
          <h3 className="font-display text-lg font-semibold mb-4">Créer un contrat directement pour un utilisateur</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={form.organizerUserId}
              onChange={(e) => setForm((p) => ({ ...p, organizerUserId: e.target.value }))}
              className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none md:col-span-2"
            >
              <option value="">Sélectionner un organisateur</option>
              {users.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} - {user.email}
                </option>
              ))}
            </select>

            <select
              value={form.artistId}
              onChange={(e) => setForm((p) => ({ ...p, artistId: e.target.value }))}
              className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none md:col-span-2"
            >
              <option value="">Sélectionner un artiste</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>{artist.name}</option>
              ))}
            </select>

            <input className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" placeholder="Nom organisateur" value={form.requesterName} onChange={(e) => setForm((p) => ({ ...p, requesterName: e.target.value }))} />
            <input className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" placeholder="Email organisateur" value={form.requesterEmail} onChange={(e) => setForm((p) => ({ ...p, requesterEmail: e.target.value }))} />

            <input className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none md:col-span-2" placeholder="Nom de l'événement" value={form.eventName} onChange={(e) => setForm((p) => ({ ...p, eventName: e.target.value }))} />
            <input type="date" className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" value={form.eventDate} onChange={(e) => setForm((p) => ({ ...p, eventDate: e.target.value }))} />
            <input className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" placeholder="Lieu" value={form.eventVenue} onChange={(e) => setForm((p) => ({ ...p, eventVenue: e.target.value }))} />
            <input className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" placeholder="Ville" value={form.eventCity} onChange={(e) => setForm((p) => ({ ...p, eventCity: e.target.value }))} />
            <input className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" placeholder="Pays (BEL)" value={form.eventCountry} onChange={(e) => setForm((p) => ({ ...p, eventCountry: e.target.value.toUpperCase() }))} />
            <select value={form.eventType} onChange={(e) => setForm((p) => ({ ...p, eventType: e.target.value }))} className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none">
              <option value="festival">Festival</option>
              <option value="club">Club</option>
              <option value="private">Privé</option>
              <option value="corporate">Corporate</option>
              <option value="other">Autre</option>
            </select>
            <input type="number" className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" placeholder="Budget min" value={form.budgetMin} onChange={(e) => setForm((p) => ({ ...p, budgetMin: e.target.value }))} />
            <input type="number" className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" placeholder="Budget max" value={form.budgetMax} onChange={(e) => setForm((p) => ({ ...p, budgetMax: e.target.value }))} />
            <input type="number" className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" placeholder="Montant contrat (quoted)" value={form.quotedAmount} onChange={(e) => setForm((p) => ({ ...p, quotedAmount: e.target.value }))} />
            <textarea rows={3} className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none md:col-span-2" placeholder="Message au client (optionnel)" value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} />
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => createContract.mutate()}
              isLoading={createContract.isPending}
              disabled={
                !form.artistId ||
                !form.eventName ||
                !form.eventDate ||
                !form.eventCity ||
                (!form.organizerUserId && (!form.requesterName || !form.requesterEmail))
              }
            >
              Créer le contrat
            </Button>
          </div>
        </Card>
      ) : null}

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
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/dashboard/contracts/${booking.id}`}
                        className="inline-flex items-center gap-1.5 text-aurora-cyan hover:underline"
                      >
                        <PenSquare size={14} /> Modifier
                      </Link>
                      {isAdmin ? (
                        <button
                          onClick={async () => {
                            if (!window.confirm('Supprimer ce contrat ?')) return;
                            try {
                              await api.delete(`/bookings/${booking.id}`);
                              queryClient.invalidateQueries({ queryKey: ['contracts-list'] });
                              addToast('success', 'Contrat supprimé');
                            } catch (error: any) {
                              const message = error?.response?.data?.message;
                              addToast('error', Array.isArray(message) ? message[0] : (message || 'Suppression impossible'));
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={14} /> Supprimer
                        </button>
                      ) : null}
                    </div>
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
