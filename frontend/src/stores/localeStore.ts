'use client';

import { create } from 'zustand';
import type { Locale } from '@/lib/i18n';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: 'fr',
  setLocale: (locale) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sauroraa-locale', locale);
      document.documentElement.lang = locale;
    }
    set({ locale });
  },
}));
