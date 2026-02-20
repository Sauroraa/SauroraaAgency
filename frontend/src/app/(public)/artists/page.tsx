'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { publicApi } from '@/lib/api';
import { useArtistFilterStore } from '@/stores/artistFilterStore';
import { ArtistCard } from '@/components/artists/ArtistCard';
import { ArtistFilters } from '@/components/artists/ArtistFilters';
import { Skeleton } from '@/components/ui/Skeleton';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { useI18n } from '@/hooks/useI18n';
import type { Artist } from '@/types/artist';

export default function ArtistsPage() {
  const { genre, country, availability, sortBy, search } = useArtistFilterStore();
  const { locale } = useI18n();

  const { data, isLoading } = useQuery({
    queryKey: ['artists', { genre, country, availability, sortBy, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (genre) params.set('genre', genre);
      if (country) params.set('country', country);
      if (availability) params.set('availability', availability);
      if (sortBy) params.set('sortBy', sortBy);
      if (search) params.set('search', search);
      params.set('limit', '24');
      const res = await publicApi.get(`/public/artists?${params}`);
      return res.data.data || res.data;
    },
  });

  const artists: Artist[] = data?.items || [];
  const copy = {
    fr: {
      roster: 'Roster',
      title: 'Nos artistes',
      subtitle: "Découvrez notre roster d'artistes électroniques soigneusement sélectionnés.",
      empty: 'Aucun artiste ne correspond à vos filtres.',
    },
    en: {
      roster: 'Roster',
      title: 'Our Artists',
      subtitle: 'Discover our carefully curated roster of electronic music talent.',
      empty: 'No artists found matching your filters.',
    },
    nl: {
      roster: 'Roster',
      title: 'Onze artiesten',
      subtitle: 'Ontdek onze zorgvuldig geselecteerde roster van elektronische artiesten.',
      empty: 'Geen artiesten gevonden met deze filters.',
    },
  }[locale];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <p className="text-sm uppercase tracking-[0.2em] text-aurora-cyan mb-3 font-mono">{copy.roster}</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">{copy.title}</h1>
        <p className="text-[var(--text-secondary)] max-w-2xl">
          {copy.subtitle}
        </p>
      </motion.div>

      <ArtistFilters />

      <div className="mt-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : artists.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {artists.map((artist) => (
              <motion.div key={artist.id} variants={staggerItem}>
                <ArtistCard artist={artist} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-24">
            <p className="text-[var(--text-muted)] text-lg">{copy.empty}</p>
          </div>
        )}
      </div>
    </div>
  );
}
