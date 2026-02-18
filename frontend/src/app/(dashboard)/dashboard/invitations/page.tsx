'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToastStore } from '@/stores/toastStore';

export default function InvitationsPage() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'manager' | 'admin'>('manager');

  const { data: invitations } = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const res = await api.get('/invitations');
      return res.data.data || res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post('/invitations', { email, role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      addToast('success', 'Invitation sent');
      setShowModal(false);
      setEmail('');
    },
    onError: () => addToast('error', 'Failed to send invitation'),
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/invitations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      addToast('success', 'Invitation revoked');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Invitations</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Invite new team members</p>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus size={16} /> Invite</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-dark-800/30">
              <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Email</th>
              <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Role</th>
              <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Status</th>
              <th className="text-left py-3 px-6 text-[var(--text-muted)] font-medium">Expires</th>
              <th className="text-right py-3 px-6 text-[var(--text-muted)] font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(invitations || []).map((inv: any) => (
              <tr key={inv.id} className="border-b border-[var(--border-color)]">
                <td className="py-3 px-6 flex items-center gap-2"><Mail size={14} className="text-[var(--text-muted)]" /> {inv.email}</td>
                <td className="py-3 px-6"><Badge variant={inv.role === 'admin' ? 'info' : 'default'}>{inv.role}</Badge></td>
                <td className="py-3 px-6">
                  <Badge variant={inv.acceptedAt ? 'success' : new Date(inv.expiresAt) < new Date() ? 'danger' : 'warning'}>
                    {inv.acceptedAt ? 'Accepted' : new Date(inv.expiresAt) < new Date() ? 'Expired' : 'Pending'}
                  </Badge>
                </td>
                <td className="py-3 px-6 text-[var(--text-muted)] text-xs">{new Date(inv.expiresAt).toLocaleDateString()}</td>
                <td className="py-3 px-6 text-right">
                  {!inv.acceptedAt && (
                    <button onClick={() => revokeMutation.mutate(inv.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400">
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Send Invitation">
        <div className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none">
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button onClick={() => createMutation.mutate()} isLoading={createMutation.isPending} className="w-full">
            <Mail size={16} /> Send Invitation
          </Button>
        </div>
      </Modal>
    </div>
  );
}
