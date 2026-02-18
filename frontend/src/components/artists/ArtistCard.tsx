'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { COUNTRIES } from '@/lib/constants';
import type { Artist } from '@/types/artist';

export function ArtistCard({ artist }: { artist: Artist }) {
  const availabilityVariant = {
    available: 'success' as const,
    limited: 'warning' as const,
    unavailable: 'danger' as const,
  };

  return (
    <Link href={`/artists/${artist.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-dark-800 border border-[var(--border-color)] hover:border-aurora-cyan/30 transition-all duration-500"
      >
        {/* Placeholder image / gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-aurora-cyan/10 via-aurora-violet/5 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Badge variant={availabilityVariant[artist.availability]}>
            {artist.availability}
          </Badge>
          {artist.isCurated && (
            <Badge variant="info">Curated</Badge>
          )}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {artist.genres?.slice(0, 2).map((genre) => (
              <span key={genre.id} className="text-[10px] uppercase tracking-wider text-aurora-cyan font-mono">
                {genre.name}
              </span>
            ))}
          </div>

          <h3 className="font-display text-xl font-bold mb-1 group-hover:text-aurora-cyan transition-colors">
            {artist.name}
          </h3>

          <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
            <MapPin size={12} />
            <span>{artist.city ? `${artist.city}, ` : ''}{COUNTRIES[artist.country] || artist.country}</span>
          </div>

          {artist.bioShort && (
            <p className="mt-3 text-xs text-[var(--text-muted)] line-clamp-2">{artist.bioShort}</p>
          )}
        </div>

        <div className="absolute top-4 right-4 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 backdrop-blur-sm">
          <ArrowRight size={16} />
        </div>
      </motion.div>
    </Link>
  );
}
