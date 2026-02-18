'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Send, Calendar, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToastStore } from '@/stores/toastStore';
import { publicApi } from '@/lib/api';
import { EVENT_TYPES, COUNTRIES } from '@/lib/constants';
import type { Artist } from '@/types/artist';

export default function ContactPage() {
  const searchParams = useSearchParams();
  const preselectedArtist = searchParams.get('artist');
  const [activeTab, setActiveTab] = useState<'booking' | 'general'>(preselectedArtist ? 'booking' : 'general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const [bookingForm, setBookingForm] = useState({
    artistId: '', requesterName: '', requesterEmail: '', requesterPhone: '',
    requesterCompany: '', eventName: '', eventDate: '', eventVenue: '',
    eventCity: '', eventCountry: 'BEL', eventType: 'festival',
    expectedAttendance: '', budgetMin: '', budgetMax: '', message: '',
  });

  const { data: artistsData } = useQuery({
    queryKey: ['artists-for-booking'],
    queryFn: async () => {
      const res = await publicApi.get('/public/artists?limit=200');
      return res.data.data || res.data;
    },
  });
  const artists: Artist[] = artistsData?.items || [];

  useEffect(() => {
    if (!preselectedArtist || bookingForm.artistId || !artists.length) return;
    const preselected = artists.find((a) => a.slug === preselectedArtist);
    if (preselected) {
      setBookingForm((prev) => ({ ...prev, artistId: preselected.id }));
    }
  }, [preselectedArtist, artists, bookingForm.artistId]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await publicApi.post('/public/bookings', {
        ...bookingForm,
        expectedAttendance: bookingForm.expectedAttendance ? Number(bookingForm.expectedAttendance) : undefined,
        budgetMin: bookingForm.budgetMin ? Number(bookingForm.budgetMin) : undefined,
        budgetMax: bookingForm.budgetMax ? Number(bookingForm.budgetMax) : undefined,
      });
      addToast('success', 'Booking request submitted successfully! We will be in touch.');
      setBookingForm({
        artistId: '', requesterName: '', requesterEmail: '', requesterPhone: '',
        requesterCompany: '', eventName: '', eventDate: '', eventVenue: '',
        eventCity: '', eventCountry: 'BEL', eventType: 'festival',
        expectedAttendance: '', budgetMin: '', budgetMax: '', message: '',
      });
    } catch {
      addToast('error', 'Failed to submit booking request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setBookingForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <p className="text-sm uppercase tracking-[0.2em] text-aurora-cyan mb-3 font-mono">Get in Touch</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Contact</h1>
        <p className="text-[var(--text-secondary)] max-w-2xl">
          Ready to book an artist or have a question? We would love to hear from you.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('booking')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'booking'
              ? 'bg-aurora-cyan/15 text-aurora-cyan border border-aurora-cyan/30'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
          }`}
        >
          <Calendar size={16} /> Booking Request
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'general'
              ? 'bg-aurora-cyan/15 text-aurora-cyan border border-aurora-cyan/30'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
          }`}
        >
          <MessageSquare size={16} /> General Inquiry
        </button>
      </div>

      {activeTab === 'booking' ? (
        <Card>
          <form onSubmit={handleBookingSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Your Name *" value={bookingForm.requesterName} onChange={(e) => updateField('requesterName', e.target.value)} required />
              <Input label="Email *" type="email" value={bookingForm.requesterEmail} onChange={(e) => updateField('requesterEmail', e.target.value)} required />
              <Input label="Phone" value={bookingForm.requesterPhone} onChange={(e) => updateField('requesterPhone', e.target.value)} />
              <Input label="Company / Organization" value={bookingForm.requesterCompany} onChange={(e) => updateField('requesterCompany', e.target.value)} />
            </div>

            <div className="border-t border-[var(--border-color)] pt-6">
              <h3 className="font-display text-lg font-semibold mb-4">Event Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">Artist *</label>
                  <select value={bookingForm.artistId} onChange={(e) => updateField('artistId', e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" required>
                    <option value="">Select an artist...</option>
                    {artists.map((artist) => (
                      <option key={artist.id} value={artist.id}>{artist.name}</option>
                    ))}
                  </select>
                </div>
                <Input label="Event Name *" value={bookingForm.eventName} onChange={(e) => updateField('eventName', e.target.value)} required />
                <Input label="Event Date *" type="date" value={bookingForm.eventDate} onChange={(e) => updateField('eventDate', e.target.value)} required />
                <Input label="Venue" value={bookingForm.eventVenue} onChange={(e) => updateField('eventVenue', e.target.value)} />
                <Input label="City *" value={bookingForm.eventCity} onChange={(e) => updateField('eventCity', e.target.value)} required />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">Country *</label>
                  <select value={bookingForm.eventCountry} onChange={(e) => updateField('eventCountry', e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" required>
                    {Object.entries(COUNTRIES).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">Event Type *</label>
                  <select value={bookingForm.eventType} onChange={(e) => updateField('eventType', e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none" required>
                    {EVENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <Input label="Expected Attendance" type="number" value={bookingForm.expectedAttendance} onChange={(e) => updateField('expectedAttendance', e.target.value)} />
              </div>
            </div>

            <div className="border-t border-[var(--border-color)] pt-6">
              <h3 className="font-display text-lg font-semibold mb-4">Budget</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Budget Min (EUR)" type="number" value={bookingForm.budgetMin} onChange={(e) => updateField('budgetMin', e.target.value)} />
                <Input label="Budget Max (EUR)" type="number" value={bookingForm.budgetMax} onChange={(e) => updateField('budgetMax', e.target.value)} />
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

            <Button type="submit" size="lg" isLoading={isSubmitting}>
              <Send size={16} /> Submit Booking Request
            </Button>
          </form>
        </Card>
      ) : (
        <Card>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Name *" required />
              <Input label="Email *" type="email" required />
            </div>
            <Input label="Subject *" required />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Message *</label>
              <textarea
                rows={6}
                className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none focus:border-aurora-cyan/50 resize-none"
                required
              />
            </div>
            <Button type="submit" size="lg">
              <Send size={16} /> Send Message
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
