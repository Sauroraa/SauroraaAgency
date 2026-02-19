'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { COUNTRIES } from '@/lib/constants';
import type { Artist } from '@/types/artist';
import { useAuthStore } from '@/stores/authStore';

export default function DashboardArtistsPage() {
  const [search, setSearch] = useState('');
  const role = useAuthStore((s) => s.user?.role);
  const isOrganizer = role === 'organizer';

  const { data, isLoading } = useQuery({
    queryKey: ['admin-artists', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('limit', '50');
      const res = await api.get(`/artists?${params}`);
      return res.data.data || res.data;
    },
  });

  const artists: Artist[] = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Artists</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage your artist roster</p>
        </div>
        {!isOrganizer && (
          <Link href="/dashboard/artists/new">
            <Button><Plus size={16} /> Add Artist</Button>
          </Link>
        )}
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search artists..."
          className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-sm outline-none focus:border-aurora-cyan/50"
        />
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-dark-800/30">
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Artist</th>
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Country</th>
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Genres</th>
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Status</th>
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Score</th>
                <th className="text-right py-3 px-6 text-[var(--text-muted)] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {artists.map((artist) => (
                <motion.tr
                  key={artist.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-[var(--border-color)] hover:bg-dark-800/30 transition-colors"
                >
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-aurora-cyan/20 to-aurora-violet/20 flex items-center justify-center text-xs font-bold">
                        {artist.name.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium">{artist.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{artist.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-[var(--text-secondary)]">
                    {COUNTRIES[artist.country] || artist.country}
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex flex-wrap gap-1">
                      {artist.genres?.slice(0, 2).map((g) => (
                        <Badge key={g.id} variant="info">{g.name}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <Badge variant={artist.availability === 'available' ? 'success' : artist.availability === 'limited' ? 'warning' : 'danger'}>
                      {artist.availability}
                    </Badge>
                  </td>
                  <td className="py-3 px-6 font-mono text-aurora-cyan">{artist.popularityScore}</td>
                  <td className="py-3 px-6">
                    <div className="flex items-center justify-end gap-2">
                      {!isOrganizer && (
                        <>
                          <Link href={`/dashboard/artists/${artist.id}`}>
                            <button className="p-1.5 rounded-lg hover:bg-dark-700 transition-colors">
                              <Edit size={14} />
                            </button>
                          </Link>
                          <button className="p-1.5 rounded-lg hover:bg-dark-700 transition-colors text-[var(--text-muted)]">
                            {artist.isConfidential ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
