'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

function ThemeInitializer() {
  const setTheme = useThemeStore((s) => s.setTheme);
  useEffect(() => {
    const saved = localStorage.getItem('sauroraa-theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
    else setTheme('dark');
  }, [setTheme]);
  return null;
}

function AuthInitializer() {
  const { user, accessToken, refreshToken, hydrateUser, logout } = useAuthStore();

  useEffect(() => {
    const bootstrap = async () => {
      if (!accessToken && !refreshToken) return;
      if (user && accessToken) return;
      try {
        const res = await api.get('/auth/me');
        const profile = res.data.data || res.data;
        hydrateUser(profile);
      } catch {
        logout();
      }
    };

    bootstrap();
  }, [user, accessToken, refreshToken, hydrateUser, logout]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000, retry: 1 },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      <AuthInitializer />
      {children}
    </QueryClientProvider>
  );
}
