export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface ArtistMedia {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnailUrl: string | null;
  title: string | null;
  sortOrder: number;
}

export interface Artist {
  id: string;
  slug: string;
  name: string;
  realName: string | null;
  bioShort: string | null;
  bioFull: string | null;
  country: string;
  city: string | null;
  availability: 'available' | 'limited' | 'unavailable';
  popularityScore: number;
  isConfidential: boolean;
  isCurated: boolean;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  spotifyUrl: string | null;
  soundcloudUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  websiteUrl: string | null;
  monthlyListeners: number | null;
  baseFeeMin: number | null;
  baseFeeMax: number | null;
  managerId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  genres: Genre[];
  media: ArtistMedia[];
  createdAt: string;
}

export interface ArtistFilters {
  genre?: string;
  country?: string;
  availability?: string;
  sortBy?: 'popularity' | 'name' | 'newest';
  search?: string;
  page?: number;
  limit?: number;
}
