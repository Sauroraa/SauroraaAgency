'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useToastStore } from '@/stores/toastStore';
import { COUNTRIES } from '@/lib/constants';
import type { Genre, Artist } from '@/types/artist';

const AVAILABILITY_OPTIONS = ['available', 'limited', 'unavailable'] as const;

export default function EditArtistPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [showDelete, setShowDelete] = useState(false);

  const [form, setForm] = useState({
    name: '', realName: '', slug: '', bioShort: '', bioFull: '',
    country: 'BEL', city: '', availability: 'available',
    spotifyUrl: '', soundcloudUrl: '', instagramUrl: '', facebookUrl: '', websiteUrl: '',
    monthlyListeners: '', baseFeeMin: '', baseFeeMax: '',
    metaTitle: '', metaDescription: '',
    isConfidential: false, isCurated: false,
  });
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

  const { data: artist, isLoading } = useQuery<Artist>({
    queryKey: ['artist', id],
    queryFn: async () => {
      const res = await api.get(`/artists/${id}`);
      return res.data.data || res.data;
    },
  });

  const { data: genres = [] } = useQuery<Genre[]>({
    queryKey: ['genres'],
    queryFn: async () => {
      const res = await api.get('/public/artists/genres');
      return res.data.data || res.data;
    },
  });

  useEffect(() => {
    if (artist) {
      setForm({
        name: artist.name || '', realName: artist.realName || '', slug: artist.slug || '',
        bioShort: artist.bioShort || '', bioFull: artist.bioFull || '',
        country: artist.country || 'BEL', city: artist.city || '',
        availability: artist.availability || 'available',
        spotifyUrl: artist.spotifyUrl || '', soundcloudUrl: artist.soundcloudUrl || '',
        instagramUrl: artist.instagramUrl || '', facebookUrl: artist.facebookUrl || '',
        websiteUrl: artist.websiteUrl || '',
        monthlyListeners: artist.monthlyListeners?.toString() || '',
        baseFeeMin: artist.baseFeeMin?.toString() || '',
        baseFeeMax: artist.baseFeeMax?.toString() || '',
        metaTitle: artist.metaTitle || '', metaDescription: artist.metaDescription || '',
        isConfidential: artist.isConfidential || false, isCurated: artist.isCurated || false,
      });
      setSelectedGenres(artist.genres?.map((g) => g.id) || []);
    }
  }, [artist]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        monthlyListeners: form.monthlyListeners ? Number(form.monthlyListeners) : null,
        baseFeeMin: form.baseFeeMin ? Number(form.baseFeeMin) : null,
        baseFeeMax: form.baseFeeMax ? Number(form.baseFeeMax) : null,
        genreIds: selectedGenres,
      };
      return api.patch(`/artists/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artists'] });
      queryClient.invalidateQueries({ queryKey: ['artist', id] });
      addToast('success', 'Artist updated successfully');
    },
    onError: () => addToast('error', 'Failed to update artist'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/artists/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artists'] });
      addToast('success', 'Artist deleted');
      router.push('/dashboard/artists');
    },
    onError: () => addToast('error', 'Failed to delete artist'),
  });

  const updateField = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  if (isLoading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-dark-700 rounded" /><div className="h-64 bg-dark-700 rounded-xl" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/artists">
            <button className="p-2 rounded-lg hover:bg-dark-700 transition-colors"><ArrowLeft size={20} /></button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold">Edit {artist?.name}</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Update artist information</p>
          </div>
        </div>
        <Button variant="danger" onClick={() => setShowDelete(true)}><Trash2 size={16} /> Delete</Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card>
          <h2 className="font-display text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Artist Name *" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
            <Input label="Real Name" value={form.realName} onChange={(e) => updateField('realName', e.target.value)} />
            <Input label="Slug *" value={form.slug} onChange={(e) => updateField('slug', e.target.value)} required />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Availability</label>
              <select value={form.availability} onChange={(e) => updateField('availability', e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none focus:border-aurora-cyan">
                {AVAILABILITY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Country *</label>
              <select value={form.country} onChange={(e) => updateField('country', e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none focus:border-aurora-cyan">
                {Object.entries(COUNTRIES).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
              </select>
            </div>
            <Input label="City" value={form.city} onChange={(e) => updateField('city', e.target.value)} />
          </div>
          <div className="mt-4 space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Short Bio</label>
            <textarea value={form.bioShort} onChange={(e) => updateField('bioShort', e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none focus:border-aurora-cyan resize-none" />
          </div>
          <div className="mt-4 space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Full Bio</label>
            <textarea value={form.bioFull} onChange={(e) => updateField('bioFull', e.target.value)} rows={6} className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none focus:border-aurora-cyan resize-none" />
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold mb-4">Genres</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                onClick={() => setSelectedGenres((prev) => prev.includes(genre.id) ? prev.filter((gid) => gid !== genre.id) : [...prev, genre.id])}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${selectedGenres.includes(genre.id) ? 'bg-aurora-cyan/20 border-aurora-cyan text-aurora-cyan' : 'border-dark-500 text-[var(--text-muted)] hover:border-dark-300'}`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold mb-4">Social Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Spotify URL" value={form.spotifyUrl} onChange={(e) => updateField('spotifyUrl', e.target.value)} />
            <Input label="SoundCloud URL" value={form.soundcloudUrl} onChange={(e) => updateField('soundcloudUrl', e.target.value)} />
            <Input label="Instagram URL" value={form.instagramUrl} onChange={(e) => updateField('instagramUrl', e.target.value)} />
            <Input label="Facebook URL" value={form.facebookUrl} onChange={(e) => updateField('facebookUrl', e.target.value)} />
            <Input label="Website URL" value={form.websiteUrl} onChange={(e) => updateField('websiteUrl', e.target.value)} />
            <Input label="Monthly Listeners" type="number" value={form.monthlyListeners} onChange={(e) => updateField('monthlyListeners', e.target.value)} />
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold mb-4">Fees & Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Base Fee Min (EUR)" type="number" value={form.baseFeeMin} onChange={(e) => updateField('baseFeeMin', e.target.value)} />
            <Input label="Base Fee Max (EUR)" type="number" value={form.baseFeeMax} onChange={(e) => updateField('baseFeeMax', e.target.value)} />
          </div>
          <div className="flex items-center gap-6 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isConfidential} onChange={(e) => updateField('isConfidential', e.target.checked)} className="rounded border-dark-500" />
              <span className="text-sm">Confidential</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isCurated} onChange={(e) => updateField('isCurated', e.target.checked)} className="rounded border-dark-500" />
              <span className="text-sm">Curated Selection</span>
            </label>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold mb-4">SEO</h2>
          <Input label="Meta Title" value={form.metaTitle} onChange={(e) => updateField('metaTitle', e.target.value)} />
          <div className="mt-4 space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Meta Description</label>
            <textarea value={form.metaDescription} onChange={(e) => updateField('metaDescription', e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none focus:border-aurora-cyan resize-none" />
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 pb-8">
          <Link href="/dashboard/artists"><Button variant="ghost">Cancel</Button></Link>
          <Button onClick={() => updateMutation.mutate()} isLoading={updateMutation.isPending}>
            <Save size={16} /> Save Changes
          </Button>
        </div>
      </motion.div>

      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Artist">
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Are you sure you want to delete <strong>{artist?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => deleteMutation.mutate()} isLoading={deleteMutation.isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
