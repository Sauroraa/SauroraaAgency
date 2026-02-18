'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { publicApi } from '@/lib/api';
import { ArtistCard } from '@/components/artists/ArtistCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { staggerContainer, staggerItem } from '@/lib/motion';
import type { Artist } from '@/types/artist';

export default function CuratedPage() {
  const { data, isLoading } = useQuery<Artist[]>({
    queryKey: ['curated-artists'],
    queryFn: async () => {
      const res = await publicApi.get('/public/artists/curated');
      return res.data.data || res.data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center max-w-3xl mx-auto"
      >
        <p className="text-sm uppercase tracking-[0.3em] text-aurora-violet mb-4 font-mono">Curated Selection</p>
        <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
          Curated by <span className="text-aurora">Sauroraa</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
          A handpicked selection of artists who define the sound of tomorrow.
          Each one chosen for their unique vision, exceptional craft, and ability to move crowds.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {data?.map((artist) => (
            <motion.div key={artist.id} variants={staggerItem}>
              <ArtistCard artist={artist} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
