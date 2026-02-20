'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Music, Instagram, Globe, ExternalLink, Calendar } from 'lucide-react';
import { publicApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { COUNTRIES } from '@/lib/constants';
import { useI18n } from '@/hooks/useI18n';
import type { Artist } from '@/types/artist';

function resolveAssetUrl(url?: string | null) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/')) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '');
    if (appUrl) return `${appUrl}${trimmed}`;
  }
  return trimmed;
}

export function ArtistProfileClient({ slug, initialArtist }: { slug: string; initialArtist?: Artist | null }) {
  const { locale } = useI18n();
  const { data: artist, isLoading } = useQuery<Artist>({
    queryKey: ['artist', slug],
    queryFn: async () => {
      const res = await publicApi.get(`/public/artists/${slug}`);
      return res.data.data || res.data;
    },
    initialData: initialArtist || undefined,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Skeleton className="h-96 rounded-2xl mb-8" />
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-96" />
      </div>
    );
  }

  const copy = {
    fr: {
      notFound: 'Artiste introuvable',
      monthlyListeners: 'auditeurs mensuels',
      about: 'À propos',
      bioFallback: 'Biographie bientôt disponible.',
      listen: 'Écouter',
      tracks: 'Tracks',
      listenSoundcloud: 'Écouter sur SoundCloud',
      book: 'Booker',
      interested: 'Intéressé(e) pour booker cet artiste pour votre événement ?',
      requestBooking: 'Demander un booking',
      connect: 'Réseaux',
      details: 'Détails',
      availability: 'Disponibilité',
      basedIn: 'Basé à',
      genres: 'Genres',
      available: 'disponible',
      limited: 'limité',
      unavailable: 'indisponible',
    },
    en: {
      notFound: 'Artist not found',
      monthlyListeners: 'monthly listeners',
      about: 'About',
      bioFallback: 'Biography coming soon.',
      listen: 'Listen',
      tracks: 'Tracks',
      listenSoundcloud: 'Listen on SoundCloud',
      book: 'Book',
      interested: 'Interested in booking this artist for your event?',
      requestBooking: 'Request Booking',
      connect: 'Connect',
      details: 'Details',
      availability: 'Availability',
      basedIn: 'Based in',
      genres: 'Genres',
      available: 'available',
      limited: 'limited',
      unavailable: 'unavailable',
    },
    nl: {
      notFound: 'Artiest niet gevonden',
      monthlyListeners: 'maandelijkse luisteraars',
      about: 'Over',
      bioFallback: 'Biografie binnenkort beschikbaar.',
      listen: 'Luisteren',
      tracks: 'Tracks',
      listenSoundcloud: 'Luister op SoundCloud',
      book: 'Boeken',
      interested: 'Interesse om deze artiest te boeken voor je event?',
      requestBooking: 'Booking aanvragen',
      connect: 'Connect',
      details: 'Details',
      availability: 'Beschikbaarheid',
      basedIn: 'Gebaseerd in',
      genres: 'Genres',
      available: 'beschikbaar',
      limited: 'beperkt',
      unavailable: 'niet beschikbaar',
    },
  }[locale];

  if (!artist) return <div className="text-center py-24">{copy.notFound}</div>;

  const galleryImage = artist.media?.find((m) => m.type === 'image')?.url || null;
  const coverImage = resolveAssetUrl(artist.coverImageUrl) || resolveAssetUrl(galleryImage);
  const profileImage = resolveAssetUrl(artist.profileImageUrl) || resolveAssetUrl(galleryImage);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="relative h-[50vh] min-h-[400px] rounded-3xl overflow-hidden mb-12">
        {coverImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${coverImage}")` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-aurora-cyan/20 via-aurora-violet/10 to-dark-900" />
        )}
        <div className="absolute inset-0 bg-dark-900/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          {profileImage && (
            <div className="mb-5 h-24 w-24 rounded-2xl overflow-hidden border border-white/20 bg-dark-800/80 backdrop-blur">
              <img src={profileImage} alt={artist.name} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-4">
            {artist.genres?.map((g) => (
              <Badge key={g.id} variant="info">{g.name}</Badge>
            ))}
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-3">{artist.name}</h1>
          <div className="flex items-center gap-4 text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <MapPin size={16} />
              {artist.city ? `${artist.city}, ` : ''}{COUNTRIES[artist.country] || artist.country}
            </span>
            {artist.monthlyListeners && (
                <span className="flex items-center gap-1.5">
                  <Music size={16} />
                {(artist.monthlyListeners / 1000).toFixed(0)}K {copy.monthlyListeners}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="font-display text-2xl font-bold mb-6">{copy.about}</h2>
            <div className="prose prose-invert max-w-none text-[var(--text-secondary)] leading-relaxed">
              {artist.bioFull || artist.bioShort || copy.bioFallback}
            </div>
          </motion.section>

          {artist.spotifyUrl && (
            <section>
              <h2 className="font-display text-2xl font-bold mb-6">{copy.listen}</h2>
              <div className="rounded-xl overflow-hidden">
                <iframe
                  src={`https://open.spotify.com/embed/artist/${artist.spotifyUrl.split('/').pop()?.split('?')[0]}`}
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-xl"
                />
              </div>
            </section>
          )}

          {artist.soundcloudUrl && (
            <section>
              <h2 className="font-display text-2xl font-bold mb-6">{copy.tracks}</h2>
              <div className="rounded-xl overflow-hidden bg-dark-800 p-6 border border-[var(--border-color)]">
                <a href={artist.soundcloudUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-aurora-cyan hover:underline">
                  <ExternalLink size={16} /> {copy.listenSoundcloud}
                </a>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6">
            <h3 className="font-display text-lg font-semibold mb-4">{copy.book} {artist.name}</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              {copy.interested}
            </p>
            <Link href={`/contact?artist=${artist.slug}`}>
              <Button className="w-full">
                <Calendar size={16} />
                {copy.requestBooking}
              </Button>
            </Link>
          </div>

          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6">
            <h3 className="font-display text-lg font-semibold mb-4">{copy.connect}</h3>
            <div className="space-y-3">
              {artist.instagramUrl && (
                <a href={artist.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-aurora-cyan transition-colors">
                  <Instagram size={18} /> Instagram
                </a>
              )}
              {artist.spotifyUrl && (
                <a href={artist.spotifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-aurora-cyan transition-colors">
                  <Music size={18} /> Spotify
                </a>
              )}
              {artist.websiteUrl && (
                <a href={artist.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-aurora-cyan transition-colors">
                  <Globe size={18} /> Website
                </a>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6">
            <h3 className="font-display text-lg font-semibold mb-4">{copy.details}</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--text-muted)]">{copy.availability}</dt>
                <dd>
                  <Badge variant={artist.availability === 'available' ? 'success' : artist.availability === 'limited' ? 'warning' : 'danger'}>
                    {artist.availability === 'available' ? copy.available : artist.availability === 'limited' ? copy.limited : copy.unavailable}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--text-muted)]">{copy.basedIn}</dt>
                <dd>{COUNTRIES[artist.country] || artist.country}</dd>
              </div>
              {artist.genres?.length > 0 && (
                <div className="flex justify-between">
                  <dt className="text-[var(--text-muted)]">{copy.genres}</dt>
                  <dd>{artist.genres.map((g) => g.name).join(', ')}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
