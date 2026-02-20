import type { Metadata } from 'next';
import { ArtistProfileClient } from '@/components/artists/ArtistProfileClient';
import type { Artist } from '@/types/artist';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const API_URL = (process.env.NEXT_PUBLIC_API_URL || `${SITE_URL}/api`).replace(/\/+$/, '');

async function fetchArtist(slug: string): Promise<Artist | null> {
  try {
    const res = await fetch(`${API_URL}/public/artists/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const artist = await fetchArtist(params.slug);
  if (!artist) {
    return { title: 'Artist Not Found' };
  }

  const title = artist.metaTitle || `${artist.name} | Artist Profile`;
  const description = artist.metaDescription || artist.bioShort || `${artist.name} represented by Sauroraa Agency.`;
  const url = `${SITE_URL}/artists/${artist.slug}`;
  const image = artist.coverImageUrl || artist.profileImageUrl || `${SITE_URL}/images/header.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'profile',
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: { canonical: url },
  };
}

export default async function ArtistProfilePage({ params }: { params: { slug: string } }) {
  const artist = await fetchArtist(params.slug);

  return (
    <>
      {artist && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'MusicGroup',
              name: artist.name,
              description: artist.bioShort || artist.bioFull || undefined,
              genre: artist.genres?.map((g) => g.name),
              url: `${SITE_URL}/artists/${artist.slug}`,
              sameAs: [artist.spotifyUrl, artist.soundcloudUrl, artist.instagramUrl, artist.facebookUrl, artist.websiteUrl].filter(Boolean),
              image: artist.profileImageUrl || artist.coverImageUrl || undefined,
            }),
          }}
        />
      )}
      <ArtistProfileClient slug={params.slug} initialArtist={artist} />
    </>
  );
}
