'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Link2, Copy, ExternalLink, Eye, EyeOff, BarChart3, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToastStore } from '@/stores/toastStore';

export default function PresskitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareForm, setShareForm] = useState({
    recipientEmail: '', recipientName: '', expiresInDays: '7',
    maxViews: '10', allowDownload: true, watermarkText: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['presskit', id],
    queryFn: async () => {
      const res = await api.get(`/presskits/${id}`);
      return res.data.data || res.data;
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ['presskit-analytics', id],
    queryFn: async () => {
      const res = await api.get(`/presskits/${id}/analytics`);
      return res.data.data || res.data;
    },
  });

  const generateLinkMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/presskits/${id}/generate-link`, {
        ...shareForm,
        expiresInHours: Number(shareForm.expiresInDays) * 24,
        maxViews: Number(shareForm.maxViews),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presskit', id] });
      addToast('success', 'Share link generated');
      setShowShareModal(false);
      setShareForm({ recipientEmail: '', recipientName: '', expiresInDays: '7', maxViews: '10', allowDownload: true, watermarkText: '' });
    },
    onError: () => addToast('error', 'Failed to generate link'),
  });

  const revokeLinkMutation = useMutation({
    mutationFn: (linkId: string) => api.patch(`/presskits/${id}/links/${linkId}/revoke`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presskit', id] });
      addToast('success', 'Link revoked');
    },
  });

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/presskit/${token}`;
    navigator.clipboard.writeText(url);
    addToast('success', 'Link copied to clipboard');
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 rounded-xl" /></div>;
  }

  const presskit = data;
  const links = presskit?.links || [];
  const sections = typeof presskit?.sections === 'string' ? JSON.parse(presskit.sections) : presskit?.sections || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/presskits">
            <button className="p-2 rounded-lg hover:bg-dark-700 transition-colors"><ArrowLeft size={20} /></button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold">{presskit?.title}</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">{presskit?.artist?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={presskit?.status === 'active' ? 'success' : presskit?.status === 'draft' ? 'default' : 'danger'}>
            {presskit?.status}
          </Badge>
          <Button onClick={() => setShowShareModal(true)}><Link2 size={16} /> Share</Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sections Preview */}
          <Card>
            <h2 className="font-display text-lg font-semibold mb-4">Sections</h2>
            <div className="space-y-3">
              {sections.map((section: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[var(--text-muted)]">{idx + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{section.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{section.type}</p>
                    </div>
                  </div>
                  {section.visible ? <Eye size={14} className="text-aurora-cyan" /> : <EyeOff size={14} className="text-[var(--text-muted)]" />}
                </div>
              ))}
              {sections.length === 0 && <p className="text-sm text-[var(--text-muted)] text-center py-4">No sections defined</p>}
            </div>
          </Card>

          {/* Event Ready */}
          {presskit?.isEventReady && (
            <Card>
              <h2 className="font-display text-lg font-semibold mb-4">Event Details</h2>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-[var(--text-muted)]">Event</p><p className="font-medium">{presskit.eventName}</p></div>
                {presskit.eventDate && <div><p className="text-[var(--text-muted)]">Date</p><p className="font-medium">{new Date(presskit.eventDate).toLocaleDateString()}</p></div>}
                {presskit.eventVenue && <div><p className="text-[var(--text-muted)]">Venue</p><p className="font-medium">{presskit.eventVenue}</p></div>}
              </div>
            </Card>
          )}

          {/* Share Links */}
          <Card>
            <h2 className="font-display text-lg font-semibold mb-4">Share Links ({links.length})</h2>
            {links.length > 0 ? (
              <div className="space-y-3">
                {links.map((link: any) => (
                  <div key={link.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{link.recipientName || link.recipientEmail}</p>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                        <span>{link.currentViews}/{link.maxViews} views</span>
                        <span>Expires: {new Date(link.expiresAt).toLocaleDateString()}</span>
                        {link.isRevoked && <Badge variant="danger">Revoked</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <button onClick={() => copyLink(link.token)} className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors" title="Copy link">
                        <Copy size={14} />
                      </button>
                      {!link.isRevoked && (
                        <button onClick={() => revokeLinkMutation.mutate(link.id)} className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors text-red-400" title="Revoke">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">No links generated yet</p>
            )}
          </Card>
        </div>

        {/* Sidebar - Analytics */}
        <div className="space-y-6">
          <Card>
            <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 size={18} /> Analytics
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Total Views</p>
              <p className="font-display text-3xl font-bold text-aurora-cyan">{analytics?.views || 0}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Downloads</p>
              <p className="font-display text-3xl font-bold">{analytics?.downloads || 0}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Unique Visitors</p>
                <p className="font-display text-3xl font-bold">{links.reduce((acc: number, item: any) => acc + (item.currentViews || 0), 0)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Avg. Time on Page</p>
                <p className="font-display text-3xl font-bold">{analytics?.avgDuration ? `${Math.round(analytics.avgDuration)}s` : '—'}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold mb-4">Info</h2>
            <div className="space-y-3 text-sm">
              <div><p className="text-[var(--text-muted)]">Template</p><p className="font-medium capitalize">{presskit?.template}</p></div>
              <div><p className="text-[var(--text-muted)]">Created</p><p className="font-medium">{new Date(presskit?.createdAt).toLocaleDateString()}</p></div>
              <div><p className="text-[var(--text-muted)]">Active Links</p><p className="font-medium">{links.filter((l: any) => !l.isRevoked).length}</p></div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Share Modal */}
      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Generate Share Link">
        <div className="space-y-4">
          <Input label="Recipient Name" value={shareForm.recipientName} onChange={(e) => setShareForm((p) => ({ ...p, recipientName: e.target.value }))} placeholder="e.g. John from Ultra" />
          <Input label="Recipient Email" type="email" value={shareForm.recipientEmail} onChange={(e) => setShareForm((p) => ({ ...p, recipientEmail: e.target.value }))} placeholder="john@ultra.com" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Expires in (days)" type="number" value={shareForm.expiresInDays} onChange={(e) => setShareForm((p) => ({ ...p, expiresInDays: e.target.value }))} />
            <Input label="Max Views" type="number" value={shareForm.maxViews} onChange={(e) => setShareForm((p) => ({ ...p, maxViews: e.target.value }))} />
          </div>
          <Input label="Watermark Text" value={shareForm.watermarkText} onChange={(e) => setShareForm((p) => ({ ...p, watermarkText: e.target.value }))} placeholder="Optional - appears on PDF downloads" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={shareForm.allowDownload} onChange={(e) => setShareForm((p) => ({ ...p, allowDownload: e.target.checked }))} className="rounded border-dark-500" />
            <span className="text-sm">Allow PDF download</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowShareModal(false)}>Cancel</Button>
            <Button onClick={() => generateLinkMutation.mutate()} isLoading={generateLinkMutation.isPending}>
              <Send size={16} /> Generate Link
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
