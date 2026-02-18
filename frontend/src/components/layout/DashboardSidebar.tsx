'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Music, FileText, Calendar, BarChart3,
  Users, Mail, Shield, Settings, LogOut, ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { useI18n } from '@/hooks/useI18n';

export function DashboardSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { t } = useI18n();
  const adminLinks = [
    { href: '/dashboard', icon: LayoutDashboard, label: t.dashboard.dashboard },
    { href: '/dashboard/artists', icon: Music, label: t.dashboard.artists },
    { href: '/dashboard/presskits', icon: FileText, label: t.dashboard.presskits },
    { href: '/dashboard/bookings', icon: Calendar, label: t.dashboard.bookings },
    { href: '/dashboard/analytics', icon: BarChart3, label: t.dashboard.analytics },
    { href: '/dashboard/managers', icon: Users, label: t.dashboard.managers },
    { href: '/dashboard/invitations', icon: Mail, label: t.dashboard.invitations },
    { href: '/dashboard/security', icon: Shield, label: t.dashboard.security },
    { href: '/dashboard/settings', icon: Settings, label: t.dashboard.settings },
  ];
  const managerLinks = [
    { href: '/dashboard', icon: LayoutDashboard, label: t.dashboard.dashboard },
    { href: '/dashboard/artists', icon: Music, label: t.dashboard.myArtists },
    { href: '/dashboard/presskits', icon: FileText, label: t.dashboard.presskits },
    { href: '/dashboard/bookings', icon: Calendar, label: t.dashboard.bookings },
    { href: '/dashboard/analytics', icon: BarChart3, label: t.dashboard.analytics },
    { href: '/dashboard/settings', icon: Settings, label: t.dashboard.settings },
  ];
  const links = user?.role === 'admin' ? adminLinks : managerLinks;

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore API logout failure and clear local state anyway
    } finally {
      logout();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-[var(--bg-secondary)] border-r border-[var(--border-color)] z-40 transition-all duration-300 flex flex-col',
      collapsed ? 'w-16' : 'w-64',
    )}>
      <div className="h-20 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
        {!collapsed && <span className="font-display text-lg font-bold text-aurora">SAURORAA</span>}
        <button onClick={onToggle} className="p-2 rounded-lg hover:bg-dark-700/50">
          <ChevronLeft size={18} className={cn('transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                isActive
                  ? 'bg-aurora-cyan/10 text-aurora-cyan'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-dark-700/50',
              )}
            >
              <link.icon size={18} />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border-color)]">
        {!collapsed && user && (
          <div className="mb-3 px-2">
            <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors"
        >
          <LogOut size={18} />
          {!collapsed && <span>{t.dashboard.logout}</span>}
        </button>
      </div>
    </aside>
  );
}
