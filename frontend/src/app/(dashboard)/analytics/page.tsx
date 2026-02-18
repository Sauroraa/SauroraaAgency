'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Globe, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AnalyticsPage() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const res = await api.get('/analytics/overview');
      return res.data.data || res.data;
    },
  });

  const { data: byArtist } = useQuery({
    queryKey: ['analytics-by-artist'],
    queryFn: async () => {
      const res = await api.get('/analytics/bookings/by-artist');
      return res.data.data || res.data;
    },
  });

  const { data: byCountry } = useQuery({
    queryKey: ['analytics-by-country'],
    queryFn: async () => {
      const res = await api.get('/analytics/bookings/by-country');
      return res.data.data || res.data;
    },
  });

  const { data: byMonth } = useQuery({
    queryKey: ['analytics-by-month'],
    queryFn: async () => {
      const res = await api.get('/analytics/bookings/by-month');
      return res.data.data || res.data;
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Track performance across your agency</p>
      </div>

      {/* Overview metrics */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <Calendar size={16} className="text-aurora-cyan" />
              <span className="text-sm text-[var(--text-muted)]">Total Bookings</span>
            </div>
            <p className="font-display text-3xl font-bold">{overview?.totalBookings || 0}</p>
          </Card>
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp size={16} className="text-emerald-400" />
              <span className="text-sm text-[var(--text-muted)]">Conversion Rate</span>
            </div>
            <p className="font-display text-3xl font-bold">{overview?.conversionRate || 0}%</p>
          </Card>
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 size={16} className="text-aurora-violet" />
              <span className="text-sm text-[var(--text-muted)]">Avg. Budget</span>
            </div>
            <p className="font-display text-3xl font-bold">{overview?.avgBudget || 0} EUR</p>
          </Card>
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <Globe size={16} className="text-aurora-pink" />
              <span className="text-sm text-[var(--text-muted)]">Recent (30d)</span>
            </div>
            <p className="font-display text-3xl font-bold">{overview?.recentBookings || 0}</p>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Artist */}
        <Card>
          <h3 className="font-display font-semibold mb-4">Bookings by Artist</h3>
          <div className="space-y-3">
            {(byArtist || []).slice(0, 10).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm">{item.artistName}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 rounded-full bg-dark-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-violet"
                      style={{ width: `${Math.min((item.count / ((byArtist?.[0]?.count) || 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono text-aurora-cyan w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
            {!byArtist?.length && <p className="text-sm text-[var(--text-muted)]">No data yet</p>}
          </div>
        </Card>

        {/* By Country */}
        <Card>
          <h3 className="font-display font-semibold mb-4">Bookings by Country</h3>
          <div className="space-y-3">
            {(byCountry || []).slice(0, 10).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm">{item.country}</span>
                <span className="text-sm font-mono text-aurora-cyan">{item.count}</span>
              </div>
            ))}
            {!byCountry?.length && <p className="text-sm text-[var(--text-muted)]">No data yet</p>}
          </div>
        </Card>
      </div>

      {/* Monthly trend */}
      <Card>
        <h3 className="font-display font-semibold mb-4">Monthly Trend</h3>
        <div className="flex items-end gap-2 h-40">
          {(byMonth || []).map((item: any, i: number) => {
            const maxCount = Math.max(...(byMonth || []).map((m: any) => Number(m.count)), 1);
            const height = (Number(item.count) / maxCount) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-mono text-aurora-cyan">{item.count}</span>
                <div
                  className="w-full rounded-t bg-gradient-to-t from-aurora-cyan/50 to-aurora-violet/50"
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
                <span className="text-[10px] text-[var(--text-muted)]">{item.month?.slice(5)}</span>
              </div>
            );
          })}
          {!byMonth?.length && <p className="text-sm text-[var(--text-muted)] mx-auto">No data yet</p>}
        </div>
      </Card>
    </div>
  );
}
