'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardTopbar } from '@/components/layout/DashboardTopbar';
import { ToastContainer } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/stores/authStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const { user, accessToken, refreshToken } = useAuthStore();

  useEffect(() => {
    if (!user && !accessToken && !refreshToken) {
      router.replace('/login');
      return;
    }

    if (!user) return;

    const path = window.location.pathname;
    const isAdmin = user.role === 'admin';
    const managerAllowed = [
      '/dashboard',
      '/dashboard/artists',
      '/dashboard/presskits',
      '/dashboard/bookings',
      '/dashboard/analytics',
      '/dashboard/settings',
    ];
    const promoterAllowed = [
      '/dashboard',
      '/dashboard/bookings',
      '/dashboard/settings',
    ];

    if (isAdmin) return;

    if (user.role === 'manager') {
      const allowed = managerAllowed.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
      if (!allowed) router.replace('/dashboard');
      return;
    }

    if (user.role === 'promoter') {
      const allowed = promoterAllowed.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
      if (!allowed) router.replace('/dashboard');
    }
  }, [user, accessToken, refreshToken, router]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={cn('transition-all duration-300', collapsed ? 'ml-16' : 'ml-64')}>
        <DashboardTopbar />
        <main className="p-6">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
