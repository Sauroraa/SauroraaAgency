'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Plus, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToastStore } from '@/stores/toastStore';
import { COUNTRIES } from '@/lib/constants';
import type { Genre } from '@/types/artist';
import { uploadToVps } from '@/lib/fileUpload';
import { useAuthStore } from '@/stores/authStore';

const AVAILABILITY_OPTIONS = ['available', 'limited', 'unavailable'] as const;
const MEDIA_TYPES = ['image', 'video', 'audio'] as const;

type MediaType = (typeof MEDIA_TYPES)[number];

type ArtistMediaForm = {
  type: MediaType;
  url: string;
  thumbnailUrl: string;
  title: string;
};

export default function NewArtistPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [form, setForm] = useState({
    name: '',
    realName: '',
    slug: '',
    bioShort: '',
    bioFull: '',
    country: 'BEL',
    city: '',
    availability: 'available' as string,
    spotifyUrl: '',
    soundcloudUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    websiteUrl: '',
    monthlyListeners: '',
    baseFeeMin: '',
    baseFeeMax: '',
    metaTitle: '',
    metaDescription: '',
    profileImageUrl: '',
    coverImageUrl: '',
    accountEmail: '',
    accountLanguage: 'fr',
    technicalRider: '',
    hospitalityRider: '',
    stagePlotUrl: '',
    inputListUrl: '',
    presskitTitle: '',
    presskitTemplate: 'event',
    isConfidential: false,
    isCurated: false,
    createPresskit: false,
  });
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingMediaIndex, setUploadingMediaIndex] = useState<number | null>(null);
  const [mediaItems, setMediaItems] = useState<ArtistMediaForm[]>([
    { type: 'image', url: '', thumbnailUrl: '', title: '' },
  ]);

  useEffect(() => {
    if (role === 'organizer') {
      router.replace('/dashboard/artists');
    }
  }, [role, router]);

  const { data: genres = [] } = useQuery<Genre[]>({
    queryKey: ['genres'],
    queryFn: async () => {
      const res = await api.get('/public/artists/genres');
      return res.data.data || res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const cleanedMedia = mediaItems
        .map((item, index) => ({
          type: item.type,
          url: item.url.trim(),
          thumbnailUrl: item.thumbnailUrl.trim() || null,
          title: item.title.trim() || null,
          sortOrder: index,
        }))
        .filter((item) => Boolean(item.url));

      const payload = {
        name: form.name,
        realName: form.realName,
        bioShort: form.bioShort,
        bioFull: form.bioFull,
        country: form.country,
        city: form.city,
        availability: form.availability,
        spotifyUrl: form.spotifyUrl,
        soundcloudUrl: form.soundcloudUrl,
        instagramUrl: form.instagramUrl,
        facebookUrl: form.facebookUrl,
        websiteUrl: form.websiteUrl,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        profileImageUrl: form.profileImageUrl,
        coverImageUrl: form.coverImageUrl,
        accountEmail: form.accountEmail,
        accountLanguage: form.accountLanguage,
        technicalRider: form.technicalRider,
        hospitalityRider: form.hospitalityRider,
        stagePlotUrl: form.stagePlotUrl,
        inputListUrl: form.inputListUrl,
        presskitTitle: form.presskitTitle,
        presskitTemplate: form.presskitTemplate,
        createPresskit: form.createPresskit,
        isConfidential: form.isConfidential,
        isCurated: form.isCurated,
        monthlyListeners: form.monthlyListeners ? Number(form.monthlyListeners) : null,
        baseFeeMin: form.baseFeeMin ? Number(form.baseFeeMin) : null,
        baseFeeMax: form.baseFeeMax ? Number(form.baseFeeMax) : null,
        genreIds: selectedGenres,
        media: cleanedMedia,
      };
      return api.post('/artists', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artists'] });
      queryClient.invalidateQueries({ queryKey: ['presskits'] });
      addToast('success', 'Artiste créé avec presskit complet');
      router.push('/dashboard/artists');
    },
    onError: () => addToast('error', 'Échec de création de l’artiste'),
  });

  const updateField = (field: string, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }));

  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const addMediaItem = () => {
    setMediaItems((prev) => [...prev, { type: 'image', url: '', thumbnailUrl: '', title: '' }]);
  };

  const removeMediaItem = (index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMediaItem = (index: number, field: keyof ArtistMediaForm, value: string) => {
    setMediaItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const uploadProfileImage = async (file?: File) => {
    if (!file) return;
    try {
      setUploadingProfile(true);
      const uploaded = await uploadToVps(file, 'artists', 'artist_profile');
      updateField('profileImageUrl', uploaded.url);
      addToast('success', 'Image profil uploadée');
    } catch {
      addToast('error', 'Upload image profil impossible');
    } finally {
      setUploadingProfile(false);
    }
  };

  const uploadCoverImage = async (file?: File) => {
    if (!file) return;
    try {
      setUploadingCover(true);
      const uploaded = await uploadToVps(file, 'artists', 'artist_cover');
      updateField('coverImageUrl', uploaded.url);
      addToast('success', 'Image cover uploadée');
    } catch {
      addToast('error', 'Upload image cover impossible');
    } finally {
      setUploadingCover(false);
    }
  };

  const uploadMediaFile = async (index: number, file?: File) => {
    if (!file) return;
    try {
      setUploadingMediaIndex(index);
      const item = mediaItems[index];
      const bucket = item.type === 'audio' ? 'presskits' : 'artists';
      const uploaded = await uploadToVps(file, bucket, 'artist_media');
      updateMediaItem(index, 'url', uploaded.url);
      if (!item.title) {
        updateMediaItem(index, 'title', uploaded.originalName);
      }
      addToast('success', 'Média uploadé');
    } catch {
      addToast('error', 'Upload média impossible');
    } finally {
      setUploadingMediaIndex(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/artists">
          <button className="p-2 rounded-lg hover:bg-dark-700 transition-colors"><ArrowLeft size={20} /></button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Nouvel artiste</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Crée un artiste avec presskit, riders et médias</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card>
          <h2 className="font-display text-lg font-semibold mb-4">Infos de base</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom artiste *"
              value={form.name}
              onChange={(e) => {
                updateField('name', e.target.value);
                if (!form.slug) updateField('slug', autoSlug(e.target.value));
              }}
              placeholder="ex: AEDEN"
              required
            />
            <Input label="Nom réel" value={form.realName} onChange={(e) => updateField('realName', e.target.value)} />
            <Input label="Slug *" value={form.slug} onChange={(e) => updateField('slug', e.target.value)} placeholder="aeden" required />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Disponibilité</label>
              <select
                value={form.availability}
                onChange={(e) => updateField('availability', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none focus:border-aurora-cyan"
              >
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Pays *</label>
              <select
                value={form.country}
                onChange={(e) => updateField('country', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none focus:border-aurora-cyan"
              >
                {Object.entries(COUNTRIES).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
            <Input label="Ville" value={form.city} onChange={(e) => updateField('city', e.target.value)} placeholder="ex: Liège" />
          </div>

          <div className="mt-4 space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Bio courte</label>
            <textarea
              value={form.bioShort}
              onChange={(e) => updateField('bioShort', e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none focus:border-aurora-cyan resize-none"
            />
          </div>

          <div className="mt-4 space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Bio complète</label>
            <textarea
              value={form.bioFull}
              onChange={(e) => updateField('bioFull', e.target.value)}
              rows={6}
              className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none focus:border-aurora-cyan resize-none"
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold mb-4">Genres</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                onClick={() => setSelectedGenres((prev) => (prev.includes(genre.id) ? prev.filter((id) => id !== genre.id) : [...prev, genre.id]))}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedGenres.includes(genre.id)
                    ? 'bg-aurora-cyan/20 border-aurora-cyan text-aurora-cyan'
                    : 'border-dark-500 text-[var(--text-muted)] hover:border-dark-300'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold mb-4">Photos & médias</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Input label="Image profil (URL)" value={form.profileImageUrl} onChange={(e) => updateField('profileImageUrl', e.target.value)} />
              <label className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
                <Upload size={12} />
                {uploadingProfile ? 'Upload...' : 'Uploader image profil'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingProfile}
                  onChange={(e) => uploadProfileImage(e.target.files?.[0])}
                />
              </label>
            </div>
            <div className="space-y-2">
              <Input label="Image cover (URL)" value={form.coverImageUrl} onChange={(e) => updateField('coverImageUrl', e.target.value)} />
              <label className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
                <Upload size={12} />
                {uploadingCover ? 'Upload...' : 'Uploader image cover'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingCover}
                  onChange={(e) => uploadCoverImage(e.target.files?.[0])}
                />
              </label>
            </div>
            <Input
              label="Email compte artiste (invitation auto)"
              type="email"
              value={form.accountEmail}
              onChange={(e) => updateField('accountEmail', e.target.value)}
              placeholder="artist@email.com"
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Langue invitation artiste</label>
              <select
                value={form.accountLanguage}
                onChange={(e) => updateField('accountLanguage', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none focus:border-aurora-cyan"
              >
                <option value="fr">Francais</option>
                <option value="en">English</option>
                <option value="nl">Nederlands</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {mediaItems.map((item, index) => (
              <div key={`media-${index}`} className="border border-dark-500 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="w-40">
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Type</label>
                    <select
                      value={item.type}
                      onChange={(e) => updateMediaItem(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none focus:border-aurora-cyan"
                    >
                      {MEDIA_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <button type="button" onClick={() => removeMediaItem(index)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
                <Input label="URL média *" value={item.url} onChange={(e) => updateMediaItem(index, 'url', e.target.value)} placeholder="https://..." />
                <label className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
                  <Upload size={12} />
                  {uploadingMediaIndex === index ? 'Upload...' : `Uploader ${item.type}`}
                  <input
                    type="file"
                    accept={item.type === 'image' ? 'image/*' : item.type === 'video' ? 'video/*' : 'audio/*'}
                    className="hidden"
                    disabled={uploadingMediaIndex === index}
                    onChange={(e) => uploadMediaFile(index, e.target.files?.[0])}
                  />
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="Titre" value={item.title} onChange={(e) => updateMediaItem(index, 'title', e.target.value)} />
                  <Input label="Thumbnail URL (optionnel)" value={item.thumbnailUrl} onChange={(e) => updateMediaItem(index, 'thumbnailUrl', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="ghost" onClick={addMediaItem}>
              <Plus size={14} /> Ajouter média
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold mb-4">Riders & presskit</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Titre presskit" value={form.presskitTitle} onChange={(e) => updateField('presskitTitle', e.target.value)} placeholder="ex: AEDEN - Agency Presskit" />
            <Input label="Template presskit" value={form.presskitTemplate} onChange={(e) => updateField('presskitTemplate', e.target.value)} placeholder="event" />
            <Input label="Stage plot URL" value={form.stagePlotUrl} onChange={(e) => updateField('stagePlotUrl', e.target.value)} placeholder="https://..." />
            <Input label="Input list URL" value={form.inputListUrl} onChange={(e) => updateField('inputListUrl', e.target.value)} placeholder="https://..." />
          </div>

          <div className="mt-4 space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Technical rider</label>
            <textarea
              value={form.technicalRider}
              onChange={(e) => updateField('technicalRider', e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none focus:border-aurora-cyan resize-none"
            />
          </div>

          <div className="mt-4 space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Hospitality rider</label>
            <textarea
              value={form.hospitalityRider}
              onChange={(e) => updateField('hospitalityRider', e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none focus:border-aurora-cyan resize-none"
            />
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.createPresskit} onChange={(e) => updateField('createPresskit', e.target.checked)} className="rounded border-dark-500" />
              <span className="text-sm">Créer automatiquement un presskit complet (sinon lie un presskit existant après création)</span>
            </label>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold mb-4">Réseaux & paramètres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Spotify URL" value={form.spotifyUrl} onChange={(e) => updateField('spotifyUrl', e.target.value)} />
            <Input label="SoundCloud URL" value={form.soundcloudUrl} onChange={(e) => updateField('soundcloudUrl', e.target.value)} />
            <Input label="Instagram URL" value={form.instagramUrl} onChange={(e) => updateField('instagramUrl', e.target.value)} />
            <Input label="Facebook URL" value={form.facebookUrl} onChange={(e) => updateField('facebookUrl', e.target.value)} />
            <Input label="Website URL" value={form.websiteUrl} onChange={(e) => updateField('websiteUrl', e.target.value)} />
            <Input label="Monthly listeners" type="number" value={form.monthlyListeners} onChange={(e) => updateField('monthlyListeners', e.target.value)} />
            <Input label="Base fee min (EUR)" type="number" value={form.baseFeeMin} onChange={(e) => updateField('baseFeeMin', e.target.value)} />
            <Input label="Base fee max (EUR)" type="number" value={form.baseFeeMax} onChange={(e) => updateField('baseFeeMax', e.target.value)} />
            <Input label="Meta title" value={form.metaTitle} onChange={(e) => updateField('metaTitle', e.target.value)} />
          </div>
          <div className="mt-4 space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Meta description</label>
            <textarea
              value={form.metaDescription}
              onChange={(e) => updateField('metaDescription', e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none focus:border-aurora-cyan resize-none"
            />
          </div>
          <div className="flex items-center gap-6 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isConfidential} onChange={(e) => updateField('isConfidential', e.target.checked)} className="rounded border-dark-500" />
              <span className="text-sm">Confidentiel</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isCurated} onChange={(e) => updateField('isCurated', e.target.checked)} className="rounded border-dark-500" />
              <span className="text-sm">Curated</span>
            </label>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 pb-8">
          <Link href="/dashboard/artists"><Button variant="ghost">Annuler</Button></Link>
          <Button onClick={() => mutation.mutate()} isLoading={mutation.isPending}>
            <Save size={16} /> Créer artiste complet
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
