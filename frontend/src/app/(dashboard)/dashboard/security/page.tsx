'use client';

import { useQuery } from '@tanstack/react-query';
import { Shield, Activity } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function SecurityPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const res = await api.get('/audit-logs?limit=100');
      return res.data.data || res.data;
    },
  });

  const logs = data?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Shield size={24} className="text-aurora-cyan" /> Security
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Audit logs and security events</p>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : logs.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-dark-800/30">
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Time</th>
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Action</th>
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Entity</th>
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => (
                <tr key={log.id} className="border-b border-[var(--border-color)]">
                  <td className="py-3 px-6 text-xs text-[var(--text-muted)] font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-6">
                    <Badge variant="info">{log.action}</Badge>
                  </td>
                  <td className="py-3 px-6 text-[var(--text-secondary)]">{log.entityType}</td>
                  <td className="py-3 px-6 text-[var(--text-muted)] font-mono text-xs">{log.ipAddress || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-[var(--text-muted)]">
            <Activity size={48} className="mx-auto mb-4 opacity-30" />
            <p>No audit logs yet</p>
          </div>
        )}
      </Card>
    </div>
  );
}
