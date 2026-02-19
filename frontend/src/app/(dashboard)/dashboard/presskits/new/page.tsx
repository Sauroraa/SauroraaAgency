'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Plus, GripVertical, Trash2, Calendar, Upload } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToastStore } from '@/stores/toastStore';
import type { Artist } from '@/types/artist';
import { uploadToVps } from '@/lib/fileUpload';
import { useAuthStore } from '@/stores/authStore';

interface Section {
  id: string;
  type: 'biography' | 'gallery' | 'videos' | 'tracks' | 'achievements' | 'technical' | 'custom';
  title: string;
  content: string;
  visible: boolean;
}

const SECTION_TYPES: { value: Section['type']; label: string }[] = [
  { value: 'biography', label: 'Biography' },
  { value: 'gallery', label: 'Photo Gallery' },
  { value: 'videos', label: 'Videos' },
  { value: 'tracks', label: 'Featured Tracks' },
  { value: 'achievements', label: 'Achievements' },
  { value: 'technical', label: 'Technical Rider' },
  { value: 'custom', label: 'Custom Section' },
];

const TEMPLATES = [
  { value: 'standard', label: 'Standard', desc: 'Bio, Gallery, Tracks' },
  { value: 'event', label: 'Event Focused', desc: 'Bio, Achievements, Technical Rider' },
  { value: 'minimal', label: 'Minimal', desc: 'Bio only' },
  { value: 'custom', label: 'Custom', desc: 'Start from scratch' },
];

const makeId = () => Math.random().toString(36).slice(2, 10);

const DEFAULT_SECTIONS: Record<string, Section[]> = {
  standard: [
    { id: makeId(), type: 'biography', title: 'Biography', content: '', visible: true },
    { id: makeId(), type: 'gallery', title: 'Photo Gallery', content: '', visible: true },
    { id: makeId(), type: 'tracks', title: 'Featured Tracks', content: '', visible: true },
  ],
  event: [
    { id: makeId(), type: 'biography', title: 'Biography', content: '', visible: true },
    { id: makeId(), type: 'achievements', title: 'Achievements', content: '', visible: true },
    { id: makeId(), type: 'technical', title: 'Technical Rider', content: '', visible: true },
  ],
  minimal: [
    { id: makeId(), type: 'biography', title: 'Biography', content: '', visible: true },
  ],
  custom: [],
};

export default function NewPresskitPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const preselectedArtistId = searchParams.get('artistId') || '';

  const [title, setTitle] = useState('');
  const [artistId, setArtistId] = useState(preselectedArtistId);
  const [template, setTemplate] = useState('standard');
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS.standard);
  const [isEventReady, setIsEventReady] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [uploadingSectionId, setUploadingSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (role === 'organizer') {
      router.replace('/dashboard/presskits');
    }
  }, [role, router]);

  const { data: artistsData } = useQuery({
    queryKey: ['admin-artists-select'],
    queryFn: async () => {
      const res = await api.get('/artists?limit=100');
      return res.data.data || res.data;
    },
  });
  const artists: Artist[] = artistsData?.items || [];

  const mutation = useMutation({
    mutationFn: async () => {
      return api.post('/presskits', {
        title, artistId, template, sections,
        isEventReady, eventName: isEventReady ? eventName : null,
        eventDate: isEventReady ? eventDate : null,
        eventVenue: isEventReady ? eventVenue : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presskits'] });
      addToast('success', 'Presskit created successfully');
      router.push('/dashboard/presskits');
    },
    onError: () => addToast('error', 'Failed to create presskit'),
  });

  const addSection = (type: Section['type']) => {
    const label = SECTION_TYPES.find((s) => s.value === type)?.label || 'Custom';
    setSections((prev) => [...prev, { id: makeId(), type, title: label, content: '', visible: true }]);
  };

  const removeSection = (id: string) => setSections((prev) => prev.filter((s) => s.id !== id));

  const updateSection = (id: string, field: keyof Section, value: any) =>
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));

  const uploadSectionFile = async (sectionId: string, file?: File) => {
    if (!file) return;
    try {
      setUploadingSectionId(sectionId);
      const uploaded = await uploadToVps(file, 'presskits', 'presskit_section');
      setSections((prev) => prev.map((s) => {
        if (s.id !== sectionId) return s;
        const nextContent = s.content ? `${s.content}\n${uploaded.url}` : uploaded.url;
        return { ...s, content: nextContent };
      }));
      addToast('success', 'Fichier presskit uploadé');
    } catch {
      addToast('error', 'Upload presskit impossible');
    } finally {
      setUploadingSectionId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/presskits">
          <button className="p-2 rounded-lg hover:bg-dark-700 transition-colors"><ArrowLeft size={20} /></button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Create Presskit</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Build a shareable presskit for an artist</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Basic */}
        <Card>
          <h2 className="font-display text-lg font-semibold mb-4">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Presskit Title *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. AEDEN - Summer 2026" required />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Artist *</label>
              <select value={artistId} onChange={(e) => setArtistId(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none focus:border-aurora-cyan" required>
                <option value="">Select artist...</option>
                {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
        </Card>

        {/* Template */}
        <Card>
          <h2 className="font-display text-lg font-semibold mb-4">Template</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => { setTemplate(t.value); setSections(DEFAULT_SECTIONS[t.value].map((s) => ({ ...s, id: makeId() }))); }}
                className={`p-4 rounded-xl border text-left transition-colors ${template === t.value ? 'bg-aurora-cyan/10 border-aurora-cyan' : 'border-dark-500 hover:border-dark-300'}`}
              >
                <p className="font-medium text-sm">{t.label}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{t.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Event Ready */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Calendar size={18} /> Event Ready
            </h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isEventReady} onChange={(e) => setIsEventReady(e.target.checked)} className="rounded border-dark-500" />
              <span className="text-sm">Enable</span>
            </label>
          </div>
          {isEventReady && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g. Tomorrowland 2026" />
              <Input label="Event Date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              <Input label="Event Venue" value={eventVenue} onChange={(e) => setEventVenue(e.target.value)} placeholder="e.g. Boom, Belgium" />
            </div>
          )}
        </Card>

        {/* Sections Builder */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Sections</h2>
            <div className="relative group">
              <Button variant="ghost" size="sm"><Plus size={14} /> Add Section</Button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-dark-800 border border-dark-500 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                {SECTION_TYPES.map((type) => (
                  <button key={type.value} onClick={() => addSection(type.value)} className="block w-full text-left px-4 py-2 text-sm hover:bg-dark-700 first:rounded-t-xl last:rounded-b-xl">
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {sections.length === 0 && (
              <p className="text-center text-sm text-[var(--text-muted)] py-8">No sections added yet. Use a template or add sections manually.</p>
            )}
            {sections.map((section, idx) => (
              <div key={section.id} className="border border-dark-500 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <GripVertical size={16} className="text-[var(--text-muted)] cursor-grab" />
                  <input
                    value={section.title}
                    onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                    className="flex-1 bg-transparent font-medium text-sm outline-none"
                  />
                  <span className="text-xs px-2 py-0.5 rounded bg-dark-700 text-[var(--text-muted)]">{section.type}</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={section.visible} onChange={(e) => updateSection(section.id, 'visible', e.target.checked)} className="rounded border-dark-500" />
                    <span className="text-xs text-[var(--text-muted)]">Visible</span>
                  </label>
                  <button onClick={() => removeSection(section.id)} className="p-1 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
                <textarea
                  value={section.content}
                  onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                  rows={3}
                  placeholder="Section content..."
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-dark-600 text-sm outline-none focus:border-aurora-cyan resize-none"
                />
                <div className="mt-2">
                  <label className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
                    <Upload size={12} />
                    {uploadingSectionId === section.id ? 'Upload...' : 'Uploader image/vidéo/fichier'}
                    <input
                      type="file"
                      className="hidden"
                      accept={section.type === 'gallery' ? 'image/*' : section.type === 'videos' ? 'video/*' : '*/*'}
                      disabled={uploadingSectionId === section.id}
                      onChange={(e) => uploadSectionFile(section.id, e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 pb-8">
          <Link href="/dashboard/presskits"><Button variant="ghost">Cancel</Button></Link>
          <Button onClick={() => mutation.mutate()} isLoading={mutation.isPending}>
            <Save size={16} /> Create Presskit
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
