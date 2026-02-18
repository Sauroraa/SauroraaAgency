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
import type { Artist } from '@/types/artist';

export function ArtistProfileClient({ slug, initialArtist }: { slug: string; initialArtist?: Artist | null }) {
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

  if (!artist) return <div className="text-center py-24">Artist not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="relative h-[50vh] min-h-[400px] rounded-3xl overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-aurora-cyan/20 via-aurora-violet/10 to-dark-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
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
                {(artist.monthlyListeners / 1000).toFixed(0)}K monthly listeners
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="font-display text-2xl font-bold mb-6">About</h2>
            <div className="prose prose-invert max-w-none text-[var(--text-secondary)] leading-relaxed">
              {artist.bioFull || artist.bioShort || 'Biography coming soon.'}
            </div>
          </motion.section>

          {artist.spotifyUrl && (
            <section>
              <h2 className="font-display text-2xl font-bold mb-6">Listen</h2>
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
              <h2 className="font-display text-2xl font-bold mb-6">Tracks</h2>
              <div className="rounded-xl overflow-hidden bg-dark-800 p-6 border border-[var(--border-color)]">
                <a href={artist.soundcloudUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-aurora-cyan hover:underline">
                  <ExternalLink size={16} /> Listen on SoundCloud
                </a>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Book {artist.name}</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Interested in booking this artist for your event?
            </p>
            <Link href={`/contact?artist=${artist.slug}`}>
              <Button className="w-full">
                <Calendar size={16} />
                Request Booking
              </Button>
            </Link>
          </div>

          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Connect</h3>
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
            <h3 className="font-display text-lg font-semibold mb-4">Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--text-muted)]">Availability</dt>
                <dd><Badge variant={artist.availability === 'available' ? 'success' : artist.availability === 'limited' ? 'warning' : 'danger'}>{artist.availability}</Badge></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--text-muted)]">Based in</dt>
                <dd>{COUNTRIES[artist.country] || artist.country}</dd>
              </div>
              {artist.genres?.length > 0 && (
                <div className="flex justify-between">
                  <dt className="text-[var(--text-muted)]">Genres</dt>
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
