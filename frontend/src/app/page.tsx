'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
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

export default function HomePage() {
  const addToast = useToastStore((s) => s.addToast);
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
      addToast('success', 'Booking request sent successfully.');
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
      addToast('error', 'Unable to submit booking. Please try again.');
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

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-aurora-cyan mb-2 font-mono">Artists</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Explore The Full Roster</h2>
            </div>
            <Link href="/artists" className="text-aurora-cyan text-sm inline-flex items-center gap-2 hover:opacity-80">
              View all artists <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="text-sm text-[var(--text-muted)]">Loading artists...</div>
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
              <p className="text-sm uppercase tracking-[0.2em] text-aurora-cyan mb-2 font-mono">Booking</p>
              <h2 className="font-display text-3xl font-bold">Book An Artist Directly</h2>
              <p className="text-[var(--text-secondary)] mt-2">Send your request now. Our team follows up quickly.</p>
            </div>

            <form onSubmit={submitBooking} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">Artist *</label>
                  <select
                    value={bookingForm.artistId}
                    onChange={(e) => updateField('artistId', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none"
                    required
                  >
                    <option value="">Select an artist...</option>
                    {artists.map((artist) => (
                      <option key={artist.id} value={artist.id}>{artist.name}</option>
                    ))}
                  </select>
                </div>

                <Input label="Your Name *" value={bookingForm.requesterName} onChange={(e) => updateField('requesterName', e.target.value)} required />
                <Input label="Email *" type="email" value={bookingForm.requesterEmail} onChange={(e) => updateField('requesterEmail', e.target.value)} required />
                <Input label="Event Name *" value={bookingForm.eventName} onChange={(e) => updateField('eventName', e.target.value)} required />
                <Input label="Event Date *" type="date" value={bookingForm.eventDate} onChange={(e) => updateField('eventDate', e.target.value)} required />
                <Input label="City *" value={bookingForm.eventCity} onChange={(e) => updateField('eventCity', e.target.value)} required />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">Event Type *</label>
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
                <label className="block text-sm font-medium text-[var(--text-secondary)]">Message</label>
                <textarea
                  value={bookingForm.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none focus:border-aurora-cyan/50 resize-none"
                  placeholder="Tell us about your event..."
                />
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" size="lg" isLoading={isSubmitting}>
                  <Send size={16} /> Send Booking Request
                </Button>
                <Link href="/contact" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  Need the full form?
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
