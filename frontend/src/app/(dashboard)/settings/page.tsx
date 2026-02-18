'use client';

import { useState } from 'react';
import { Settings, User, Lock, Palette } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Settings size={24} /> Settings
        </h1>
      </div>

      {/* Profile */}
      <Card>
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><User size={16} /> Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="First Name" defaultValue={user?.firstName} />
          <Input label="Last Name" defaultValue={user?.lastName} />
          <Input label="Email" type="email" defaultValue={user?.email} disabled className="md:col-span-2" />
        </div>
        <div className="mt-4">
          <Button>Save Changes</Button>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Palette size={16} /> Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-[var(--text-muted)]">Current: {theme}</p>
          </div>
          <Button variant="secondary" onClick={toggleTheme}>
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
        </div>
      </Card>

      {/* Security */}
      <Card>
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Lock size={16} /> Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-[var(--text-muted)]">Add an extra layer of security</p>
            </div>
            <Button variant="secondary" size="sm">Enable 2FA</Button>
          </div>
          <div className="pt-4 border-t border-[var(--border-color)]">
            <p className="text-sm font-medium mb-3">Change Password</p>
            <div className="space-y-3 max-w-sm">
              <Input label="Current Password" type="password" />
              <Input label="New Password" type="password" />
              <Input label="Confirm Password" type="password" />
              <Button>Update Password</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
