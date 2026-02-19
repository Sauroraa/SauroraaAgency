import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchArtistSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/public/artists?limit=500`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    const items = (json.data || json)?.items || [];
    return items.map((artist: any) => artist.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/artists', '/curated', '/about', '/contact', '/mentions-legales'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : path === '/mentions-legales' ? 0.4 : 0.8,
  }));

  const slugs = await fetchArtistSlugs();
  const artistRoutes = slugs.map((slug) => ({
    url: `${SITE_URL}/artists/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...artistRoutes];
}
