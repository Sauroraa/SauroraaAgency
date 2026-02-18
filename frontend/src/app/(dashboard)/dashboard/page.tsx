'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Calendar, FileText, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/authStore';

function MetricCard({ title, value, icon: Icon, change, trend }: {
  title: string; value: string | number; icon: any; change?: string; trend?: 'up' | 'down';
}) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <p className="text-sm text-[var(--text-muted)] mb-1">{title}</p>
        <p className="text-3xl font-display font-bold">{value}</p>
        {change && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {change}
          </div>
        )}
      </div>
      <div className="p-3 rounded-xl bg-aurora-cyan/10">
        <Icon size={20} className="text-aurora-cyan" />
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isPromoter = user?.role === 'promoter';

  const { data: overview, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    enabled: !isPromoter,
    queryFn: async () => {
      const res = await api.get('/analytics/overview');
      return res.data.data || res.data;
    },
  });

  const { data: recentBookings } = useQuery({
    queryKey: ['recent-bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings?limit=5');
      return res.data.data || res.data;
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">
          Welcome back, {user?.firstName || 'Admin'}
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {isPromoter
            ? 'Here is your booking activity overview.'
            : 'Here is what is happening with your agency today.'}
        </p>
      </div>

      {/* Metrics Grid */}
      {!isPromoter && isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <MetricCard title="Total Bookings" value={overview?.totalBookings || recentBookings?.items?.length || 0} icon={Calendar} change="+12% this month" trend="up" />
          <MetricCard title="New Requests" value={overview?.newBookings || recentBookings?.items?.length || 0} icon={TrendingUp} change="+3 today" trend="up" />
          <MetricCard title="Conversion Rate" value={`${overview?.conversionRate || 0}%`} icon={Users} />
          <MetricCard title="Avg. Budget" value={`${overview?.avgBudget || 0} EUR`} icon={FileText} />
        </motion.div>
      )}

      {/* Recent Bookings */}
      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">Recent Bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Reference</th>
                <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Artist</th>
                <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Event</th>
                <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Status</th>
                <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings?.items?.map((booking: any) => (
                <tr key={booking.id} className="border-b border-[var(--border-color)] hover:bg-dark-800/50">
                  <td className="py-3 px-4 font-mono text-aurora-cyan">{booking.referenceCode}</td>
                  <td className="py-3 px-4">{booking.artist?.name || 'N/A'}</td>
                  <td className="py-3 px-4">{booking.eventName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-aurora-cyan/10 text-aurora-cyan">
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">{booking.score || '-'}/100</td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--text-muted)]">No bookings yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
