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
