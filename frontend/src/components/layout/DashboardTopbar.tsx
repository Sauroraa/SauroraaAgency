'use client';

import { Bell, Search } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuthStore } from '@/stores/authStore';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useI18n } from '@/hooks/useI18n';

export function DashboardTopbar() {
  const user = useAuthStore((s) => s.user);
  const { t } = useI18n();

  return (
    <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between px-6">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Search size={18} className="text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder={t.dashboard.search}
          className="bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-full"
        />
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <ThemeToggle />
        <button className="p-2 rounded-lg hover:bg-dark-700/50 relative">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-aurora-cyan" />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-[var(--border-color)]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aurora-cyan to-aurora-violet flex items-center justify-center text-xs font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
        </div>
      </div>
    </header>
  );
}
