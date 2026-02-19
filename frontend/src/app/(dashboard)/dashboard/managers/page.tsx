'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Shield, Trash2, UserX, UserCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';

export default function ManagersPage() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === 'admin';

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users?limit=50');
      return res.data.data || res.data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      api.patch(`/users/${userId}/status`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      addToast('success', 'Statut du manager mis à jour');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message;
      addToast('error', Array.isArray(message) ? message[0] : (message || 'Impossible de modifier ce compte'));
    },
  });

  const deleteManager = useMutation({
    mutationFn: async (userId: string) => api.delete(`/users/${userId}/permanent`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      addToast('success', 'Manager supprimé définitivement');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message;
      addToast('error', Array.isArray(message) ? message[0] : (message || 'Impossible de supprimer ce compte'));
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
                {isAdmin && <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => {
                const isSelf = currentUser?.id === user.id;
                const isManager = user.role === 'manager';
                const canManage = isAdmin && !isSelf && isManager;

                return (
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
                      <Badge variant={user.role === 'admin' ? 'info' : user.role === 'promoter' ? 'warning' : user.role === 'organizer' ? 'info' : 'default'}>
                        {user.role === 'admin'
                          ? <><Shield size={10} className="mr-1" /> Admin</>
                          : user.role === 'promoter'
                            ? 'Promoter'
                            : user.role === 'organizer'
                              ? 'Organizer'
                              : 'Manager'}
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
                    {isAdmin && (
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={!canManage || updateStatus.isPending}
                            onClick={() => updateStatus.mutate({ userId: user.id, isActive: !user.isActive })}
                            className="disabled:opacity-50"
                          >
                            {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                            {user.isActive ? 'Désactiver' : 'Réactiver'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={!canManage || deleteManager.isPending}
                            onClick={() => {
                              if (window.confirm('Supprimer définitivement ce compte manager ?')) {
                                deleteManager.mutate(user.id);
                              }
                            }}
                            className="text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                          >
                            <Trash2 size={14} /> Supprimer
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
