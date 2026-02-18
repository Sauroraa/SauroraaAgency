import { create } from 'zustand';

interface ArtistFilterState {
  genre: string | null;
  country: string | null;
  availability: string | null;
  sortBy: 'popularity' | 'name' | 'newest';
  search: string;
  setGenre: (genre: string | null) => void;
  setCountry: (country: string | null) => void;
  setAvailability: (availability: string | null) => void;
  setSortBy: (sortBy: 'popularity' | 'name' | 'newest') => void;
  setSearch: (search: string) => void;
  reset: () => void;
}

export const useArtistFilterStore = create<ArtistFilterState>((set) => ({
  genre: null,
  country: null,
  availability: null,
  sortBy: 'popularity',
  search: '',
  setGenre: (genre) => set({ genre }),
  setCountry: (country) => set({ country }),
  setAvailability: (availability) => set({ availability }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSearch: (search) => set({ search }),
  reset: () => set({ genre: null, country: null, availability: null, sortBy: 'popularity', search: '' }),
}));
