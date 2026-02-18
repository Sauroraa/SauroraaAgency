'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { publicApi } from '@/lib/api';
import type { Artist } from '@/types/artist';
import { useI18n } from '@/hooks/useI18n';

export function FeaturedArtists() {
  const { t } = useI18n();
  const { data } = useQuery<Artist[]>({
    queryKey: ['featured-artists-home'],
    queryFn: async () => {
      const res = await publicApi.get('/public/artists/curated');
      return (res.data.data || res.data || []).slice(0, 4);
    },
  });
  const artists = data || [];

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-16"
        >
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-aurora-cyan mb-3 font-mono">{t.home.featuredTag}</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold">{t.home.featuredTitle}</h2>
          </div>
          <Link
            href="/artists"
            className="hidden md:flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-aurora-cyan transition-colors"
          >
            {t.home.viewAll} <ArrowRight size={16} />
          </Link>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {artists.map((artist) => (
            <motion.div key={artist.slug} variants={staggerItem}>
              <Link href={`/artists/${artist.slug}`}>
                <div className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-dark-800 border border-[var(--border-color)] hover:border-aurora-cyan/30 transition-all duration-500">
                  {/* Placeholder gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-aurora-cyan/20 via-aurora-violet/10 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-xs uppercase tracking-wider text-aurora-cyan mb-1 font-mono">{artist.genres?.[0]?.name || 'Artist'}</p>
                    <h3 className="font-display text-2xl font-bold mb-1 group-hover:text-aurora-cyan transition-colors">{artist.name}</h3>
                    <p className="text-sm text-[var(--text-muted)]">{artist.country}</p>
                  </div>

                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 backdrop-blur-sm">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {!artists.length && (
          <div className="text-center text-sm text-[var(--text-muted)]">{t.home.noFeatured}</div>
        )}

        <div className="md:hidden mt-8 text-center">
          <Link href="/artists" className="text-aurora-cyan text-sm flex items-center justify-center gap-2">
            {t.home.viewAllArtists} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
