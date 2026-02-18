import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Providers } from '@/components/layout/Providers';
import { CustomCursor } from '@/components/effects/CustomCursor';
import './globals.css';

const clashDisplay = localFont({
  src: '../../public/fonts/ClashDisplay-Variable.woff2',
  variable: '--font-clash-display',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const satoshi = localFont({
  src: '../../public/fonts/Satoshi-Variable.woff2',
  variable: '--font-satoshi',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const jetbrains = localFont({
  src: '../../public/fonts/JetBrainsMono-Variable.woff2',
  variable: '--font-jetbrains',
  display: 'swap',
  fallback: ['monospace'],
});

export const metadata: Metadata = {
  title: {
    default: 'Sauroraa Agency | Premium Artist Management',
    template: '%s | Sauroraa Agency',
  },
  description: 'Sauroraa Agency - Premium electronic music artist management, booking, and presskit platform.',
  keywords: ['music agency', 'artist management', 'booking', 'electronic music', 'DJ agency', 'presskit'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Sauroraa Agency',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${clashDisplay.variable} ${satoshi.variable} ${jetbrains.variable}`}>
        <Providers>
          <CustomCursor />
          {children}
        </Providers>
      </body>
    </html>
  );
}
