'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, FileText, ExternalLink, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function PresskitsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['presskits'],
    queryFn: async () => {
      const res = await api.get('/presskits?limit=50');
      return res.data.data || res.data;
    },
  });

  const presskits = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Presskits</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Create and manage artist presskits</p>
        </div>
        <Link href="/dashboard/presskits/new">
          <Button><Plus size={16} /> Create Presskit</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : presskits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presskits.map((pk: any) => (
            <Card key={pk.id} hover>
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-aurora-violet/10">
                  <FileText size={20} className="text-aurora-violet" />
                </div>
                <Badge variant={pk.status === 'active' ? 'success' : pk.status === 'draft' ? 'default' : 'danger'}>
                  {pk.status}
                </Badge>
              </div>
              <h3 className="font-display font-semibold mb-1">{pk.title}</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">{pk.artist?.name || 'N/A'}</p>
              {pk.isEventReady && (
                <p className="text-xs text-aurora-cyan mb-3">Event Ready: {pk.eventName}</p>
              )}
              <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-color)]">
                <Link href={`/dashboard/presskits/${pk.id}`} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-aurora-cyan">
                  <Eye size={12} /> Details
                </Link>
                <span className="text-xs text-[var(--text-muted)]">{pk.links?.length || 0} links</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <FileText size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">No presskits yet</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6">Create your first presskit to share with promoters.</p>
          <Link href="/dashboard/presskits/new"><Button><Plus size={16} /> Create Presskit</Button></Link>
        </Card>
      )}
    </div>
  );
}
