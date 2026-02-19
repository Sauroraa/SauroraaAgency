import type { Metadata } from 'next';
import { JetBrains_Mono, Manrope, Space_Grotesk } from 'next/font/google';
import { Providers } from '@/components/layout/Providers';
import { CustomCursor } from '@/components/effects/CustomCursor';
import './globals.css';

const clashDisplay = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-clash-display',
  display: 'swap',
});

const satoshi = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-satoshi',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agency.sauroraa.be';
const OG_IMAGE = '/images/header.png';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Sauroraa Agency',
  title: {
    default: 'Sauroraa Agency | Premium Artist Management',
    template: '%s | Sauroraa Agency',
  },
  description:
    'Sauroraa Agency - Management premium d artistes electroniques, booking international et presskits professionnels.',
  keywords: [
    'sauroraa agency',
    'music agency',
    'artist management',
    'booking dj',
    'electronic music',
    'presskit',
    'liege belgique',
  ],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'Sauroraa Agency | Premium Artist Management',
    description:
      'Management premium d artistes electroniques, booking international et presskits professionnels.',
    type: 'website',
    url: SITE_URL,
    locale: 'fr_BE',
    siteName: 'Sauroraa Agency',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Sauroraa Agency header',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sauroraa Agency | Premium Artist Management',
    description:
      'Management premium d artistes electroniques, booking international et presskits professionnels.',
    images: [OG_IMAGE],
  },
  icons: {
    icon: '/icons/favicon.png',
    shortcut: '/icons/favicon.png',
    apple: '/icons/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${clashDisplay.variable} ${satoshi.variable} ${jetbrains.variable}`}>
        <Providers>
          <CustomCursor />
          {children}
        </Providers>
      </body>
    </html>
  );
}
