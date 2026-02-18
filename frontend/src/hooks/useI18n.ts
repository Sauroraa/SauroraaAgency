'use client';

import { translations } from '@/lib/i18n';
import { useLocaleStore } from '@/stores/localeStore';

export function useI18n() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const dict = translations[locale];

  return {
    locale,
    setLocale,
    t: dict,
  };
}
