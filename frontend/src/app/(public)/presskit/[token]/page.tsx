'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Music, Calendar, Download, ExternalLink } from 'lucide-react';
import { publicApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { COUNTRIES } from '@/lib/constants';

export default function PresskitViewerPage() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['presskit-view', token],
    queryFn: async () => {
      const res = await publicApi.get(`/public/presskits/${token}`);
      return res.data.data || res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Skeleton className="h-64 rounded-2xl mb-8" />
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-6 w-96" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-[var(--text-muted)]">
          This presskit link is invalid, expired, or has reached its maximum views.
        </p>
      </div>
    );
  }

  const { presskit, artist, allowDownload, watermarkText } = data;
  const sections = useMemo(
    () => (Array.isArray(presskit?.sections) ? presskit.sections.filter((s: any) => s?.visible !== false) : []),
    [presskit?.sections],
  );

  useEffect(() => {
    if (!token) return;
    publicApi.post(`/public/presskits/${token}/track`, { action: 'view' }).catch(() => undefined);
  }, [token]);

  const handleSectionView = (sectionId?: string) => {
    if (!token) return;
    publicApi.post(`/public/presskits/${token}/track`, { action: 'section_view', sectionId }).catch(() => undefined);
  };

  const handleDownload = async () => {
    if (!token) return;
    try {
      const res = await publicApi.get(`/public/presskits/${token}/download`, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${artist?.slug || 'presskit'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // ignored: UI already protects with allowDownload
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="info">Presskit</Badge>
          {presskit?.isEventReady && <Badge variant="warning">Event Ready</Badge>}
        </div>

        <div className="relative h-64 rounded-2xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-aurora-cyan/20 via-aurora-violet/10 to-dark-900" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">{artist?.name}</h1>
            <p className="text-[var(--text-secondary)] flex items-center gap-2">
              <MapPin size={16} /> {artist?.city ? `${artist.city}, ` : ''}{COUNTRIES[artist?.country] || artist?.country}
            </p>
          </div>
        </div>

        {/* Event info */}
        {presskit?.isEventReady && presskit.eventName && (
          <div className="rounded-xl bg-aurora-cyan/5 border border-aurora-cyan/20 p-6 mb-8">
            <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-aurora-cyan" /> Prepared for: {presskit.eventName}
            </h3>
            <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
              {presskit.eventDate && <span>Date: {new Date(presskit.eventDate).toLocaleDateString()}</span>}
              {presskit.eventVenue && <span>Venue: {presskit.eventVenue}</span>}
              {presskit.eventCity && <span>City: {presskit.eventCity}</span>}
            </div>
          </div>
        )}
      </motion.div>

      {/* Content sections */}
      <div className="space-y-12">
        {/* Bio */}
        <section onMouseEnter={() => handleSectionView('biography')}>
          <h2 className="font-display text-2xl font-bold mb-4">Biography</h2>
          <div className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
            {artist?.bioFull || artist?.bioShort || 'No biography available.'}
          </div>
        </section>

        {/* Dynamic sections */}
        {sections.map((section: any, index: number) => (
          <section key={section.id || index} onMouseEnter={() => handleSectionView(section.id || `section-${index}`)}>
            <h2 className="font-display text-2xl font-bold mb-4">{section.title || 'Section'}</h2>
            <div className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
              {section.content || 'No content available.'}
            </div>
          </section>
        ))}

        {/* Genres & Info */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6">
            <h3 className="text-sm text-[var(--text-muted)] uppercase tracking-wider mb-2">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {artist?.genres?.map((g: any) => (
                <Badge key={g.id} variant="info">{g.name}</Badge>
              ))}
            </div>
          </div>
          {artist?.monthlyListeners && (
            <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6">
              <h3 className="text-sm text-[var(--text-muted)] uppercase tracking-wider mb-2">Streaming</h3>
              <p className="font-display text-2xl font-bold">{(artist.monthlyListeners / 1000).toFixed(0)}K</p>
              <p className="text-xs text-[var(--text-muted)]">Monthly Listeners</p>
            </div>
          )}
          <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6">
            <h3 className="text-sm text-[var(--text-muted)] uppercase tracking-wider mb-2">Links</h3>
            <div className="space-y-2">
              {artist?.spotifyUrl && (
                <a href={artist.spotifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-aurora-cyan hover:underline">
                  <Music size={14} /> Spotify
                </a>
              )}
              {artist?.soundcloudUrl && (
                <a href={artist.soundcloudUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-aurora-cyan hover:underline">
                  <ExternalLink size={14} /> SoundCloud
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Download */}
        {allowDownload && (
          <section className="text-center py-8 border-t border-[var(--border-color)]">
            <Button size="lg" onClick={handleDownload}>
              <Download size={16} /> Download Presskit PDF
            </Button>
            {watermarkText && (
              <p className="text-xs text-[var(--text-muted)] mt-3">
                Downloaded files will be watermarked: {watermarkText}
              </p>
            )}
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-[var(--border-color)] text-center">
        <p className="text-sm text-[var(--text-muted)]">
          This presskit is provided by <span className="text-aurora">Sauroraa Agency</span>
        </p>
      </div>
    </div>
  );
}
