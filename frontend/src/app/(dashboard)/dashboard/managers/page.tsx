'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ManagersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users?limit=50');
      return res.data.data || res.data;
    },
  });

  const users = data?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Managers</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Manage team members and roles</p>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-dark-800/30">
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">User</th>
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Email</th>
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Role</th>
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Status</th>
                <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id} className="border-b border-[var(--border-color)] hover:bg-dark-800/30">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aurora-cyan to-aurora-violet flex items-center justify-center text-xs font-bold">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <span className="font-medium">{user.firstName} {user.lastName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-[var(--text-secondary)]">{user.email}</td>
                  <td className="py-3 px-6">
                    <Badge variant={user.role === 'admin' ? 'info' : user.role === 'promoter' ? 'warning' : 'default'}>
                      {user.role === 'admin' ? <><Shield size={10} className="mr-1" /> Admin</> : user.role === 'promoter' ? 'Promoter' : 'Manager'}
                    </Badge>
                  </td>
                  <td className="py-3 px-6">
                    <Badge variant={user.isActive ? 'success' : 'danger'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="py-3 px-6 text-[var(--text-muted)] text-xs">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
