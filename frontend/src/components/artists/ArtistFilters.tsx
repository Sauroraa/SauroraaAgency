'use client';

import { Search, X } from 'lucide-react';
import { useArtistFilterStore } from '@/stores/artistFilterStore';
import { COUNTRIES } from '@/lib/constants';
import { useI18n } from '@/hooks/useI18n';

const genres = [
  { slug: 'techno', name: 'Techno' },
  { slug: 'house', name: 'House' },
  { slug: 'minimal', name: 'Minimal' },
  { slug: 'deep-house', name: 'Deep House' },
  { slug: 'tech-house', name: 'Tech House' },
  { slug: 'melodic-techno', name: 'Melodic Techno' },
  { slug: 'hard-techno', name: 'Hard Techno' },
  { slug: 'drum-and-bass', name: 'D&B' },
];

export function ArtistFilters() {
  const { locale } = useI18n();
  const { genre, country, availability, sortBy, search, setGenre, setCountry, setAvailability, setSortBy, setSearch, reset } = useArtistFilterStore();
  const hasFilters = genre || country || availability || search;
  const copy = {
    fr: {
      search: 'Rechercher des artistes...',
      allCountries: 'Tous les pays',
      allAvailability: 'Toutes disponibilités',
      available: 'Disponible',
      limited: 'Limité',
      unavailable: 'Indisponible',
      mostPopular: 'Les plus populaires',
      nameAZ: 'Nom A-Z',
      newest: 'Les plus récents',
      clear: 'Effacer',
    },
    en: {
      search: 'Search artists...',
      allCountries: 'All Countries',
      allAvailability: 'All Availability',
      available: 'Available',
      limited: 'Limited',
      unavailable: 'Unavailable',
      mostPopular: 'Most Popular',
      nameAZ: 'Name A-Z',
      newest: 'Newest',
      clear: 'Clear',
    },
    nl: {
      search: 'Zoek artiesten...',
      allCountries: 'Alle landen',
      allAvailability: 'Alle beschikbaarheden',
      available: 'Beschikbaar',
      limited: 'Beperkt',
      unavailable: 'Niet beschikbaar',
      mostPopular: 'Meest populair',
      nameAZ: 'Naam A-Z',
      newest: 'Nieuwste',
      clear: 'Wissen',
    },
  }[locale];

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={copy.search}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-sm outline-none focus:border-aurora-cyan/50 transition-colors"
        />
      </div>

      {/* Genre pills */}
      <div className="flex flex-wrap gap-2">
        {genres.map((g) => (
          <button
            key={g.slug}
            onClick={() => setGenre(genre === g.slug ? null : g.slug)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              genre === g.slug
                ? 'bg-aurora-cyan/15 border-aurora-cyan/30 text-aurora-cyan'
                : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--border-hover)]'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={country || ''}
          onChange={(e) => setCountry(e.target.value || null)}
          className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-sm outline-none"
        >
          <option value="">{copy.allCountries}</option>
          {Object.entries(COUNTRIES).map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>

        <select
          value={availability || ''}
          onChange={(e) => setAvailability(e.target.value || null)}
          className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-sm outline-none"
        >
          <option value="">{copy.allAvailability}</option>
          <option value="available">{copy.available}</option>
          <option value="limited">{copy.limited}</option>
          <option value="unavailable">{copy.unavailable}</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-sm outline-none"
        >
          <option value="popularity">{copy.mostPopular}</option>
          <option value="name">{copy.nameAZ}</option>
          <option value="newest">{copy.newest}</option>
        </select>

        {hasFilters && (
          <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-400 hover:text-red-300">
            <X size={14} /> {copy.clear}
          </button>
        )}
      </div>
    </div>
  );
}
