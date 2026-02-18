'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Send } from 'lucide-react';
import { PublicNav } from '@/components/layout/PublicNav';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { AuroraGradient } from '@/components/effects/AuroraGradient';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedArtists } from '@/components/home/FeaturedArtists';
import { StatsCounter } from '@/components/home/StatsCounter';
import { ArtistCard } from '@/components/artists/ArtistCard';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { publicApi } from '@/lib/api';
import { useToastStore } from '@/stores/toastStore';
import { EVENT_TYPES } from '@/lib/constants';
import type { Artist } from '@/types/artist';
import { useI18n } from '@/hooks/useI18n';

export default function HomePage() {
  const addToast = useToastStore((s) => s.addToast);
  const { t } = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    artistId: '',
    requesterName: '',
    requesterEmail: '',
    eventName: '',
    eventDate: '',
    eventCity: '',
    eventType: 'festival',
    message: '',
  });

  const { data: artistsData, isLoading } = useQuery({
    queryKey: ['home-artists'],
    queryFn: async () => {
      const res = await publicApi.get('/public/artists?limit=12');
      return res.data.data || res.data;
    },
  });

  const artists: Artist[] = artistsData?.items || [];

  const updateField = (field: string, value: string) => {
    setBookingForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await publicApi.post('/public/bookings', {
        ...bookingForm,
        eventCountry: 'BEL',
      });
      addToast('success', t.home.bookingSuccess);
      setBookingForm({
        artistId: '',
        requesterName: '',
        requesterEmail: '',
        eventName: '',
        eventDate: '',
        eventCity: '',
        eventType: 'festival',
        message: '',
      });
    } catch {
      addToast('error', t.home.bookingError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AuroraGradient />
      <PublicNav />
      <main className="relative z-10">
        <HeroSection />
        <FeaturedArtists />
        <StatsCounter />
        <section className="max-w-7xl mx-auto px-6 pb-8">
          <div className="rounded-3xl border border-aurora-cyan/20 bg-dark-900/40 backdrop-blur overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-[var(--border-color)]">
                <p className="text-sm uppercase tracking-[0.2em] text-aurora-cyan mb-3 font-mono">SAURORAA LEGAL</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">SAURORAA SNC</h2>
                <p className="text-[var(--text-secondary)] mb-6">
                  N° 1031.598.463 · Région de Liège · Belgique
                </p>
                <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <p>booking@sauroraa.be</p>
                  <p>contact@sauroraa.be</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/mentions-legales" className="text-sm text-aurora-cyan hover:opacity-80 transition-opacity">
                    Voir les mentions légales
                  </Link>
                  <Link href="/contact" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    Contact pro
                  </Link>
                </div>
              </div>
              <div className="p-8 md:p-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Structure', value: 'SNC' },
                  { label: 'Numéro', value: '1031.598.463' },
                  { label: 'Zone', value: 'Liège' },
                  { label: 'Bookings', value: 'Direct + Agency' },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.06 }}
                    className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4"
                  >
                    <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">{item.label}</p>
                    <p className="font-display text-xl font-semibold">{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-aurora-cyan mb-2 font-mono">{t.home.rosterTag}</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold">{t.home.rosterTitle}</h2>
            </div>
            <Link href="/artists" className="text-aurora-cyan text-sm inline-flex items-center gap-2 hover:opacity-80">
              {t.home.viewAllArtists} <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="text-sm text-[var(--text-muted)]">{t.home.loadingArtists}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          )}
        </section>

        <section id="book-now" className="max-w-5xl mx-auto px-6 pb-24">
          <Card>
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.2em] text-aurora-cyan mb-2 font-mono">{t.home.bookingTag}</p>
              <h2 className="font-display text-3xl font-bold">{t.home.bookingTitle}</h2>
              <p className="text-[var(--text-secondary)] mt-2">{t.home.bookingSubtitle}</p>
            </div>

            <form onSubmit={submitBooking} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">{t.home.selectArtist}</label>
                  <select
                    value={bookingForm.artistId}
                    onChange={(e) => updateField('artistId', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none"
                    required
                  >
                    <option value="">{t.home.selectArtistPlaceholder}</option>
                    {artists.map((artist) => (
                      <option key={artist.id} value={artist.id}>{artist.name}</option>
                    ))}
                  </select>
                </div>

                <Input label={t.home.yourName} value={bookingForm.requesterName} onChange={(e) => updateField('requesterName', e.target.value)} required />
                <Input label={t.home.email} type="email" value={bookingForm.requesterEmail} onChange={(e) => updateField('requesterEmail', e.target.value)} required />
                <Input label={t.home.eventName} value={bookingForm.eventName} onChange={(e) => updateField('eventName', e.target.value)} required />
                <Input label={t.home.eventDate} type="date" value={bookingForm.eventDate} onChange={(e) => updateField('eventDate', e.target.value)} required />
                <Input label={t.home.city} value={bookingForm.eventCity} onChange={(e) => updateField('eventCity', e.target.value)} required />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">{t.home.eventType}</label>
                  <select
                    value={bookingForm.eventType}
                    onChange={(e) => updateField('eventType', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none"
                    required
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">{t.home.message}</label>
                <textarea
                  value={bookingForm.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none focus:border-aurora-cyan/50 resize-none"
                  placeholder={t.home.messagePlaceholder}
                />
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" size="lg" isLoading={isSubmitting}>
                  <Send size={16} /> {t.home.sendBooking}
                </Button>
                <Link href="/contact" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  {t.home.fullForm}
                </Link>
              </div>
            </form>
          </Card>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
