'use client';

import { useI18n } from '@/hooks/useI18n';
import type { Locale } from '@/lib/i18n';

const options: Locale[] = ['fr', 'en', 'nl'];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="inline-flex items-center rounded-lg border border-[var(--border-color)] overflow-hidden">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          className={`px-2.5 py-1 text-xs uppercase tracking-wide transition-colors ${
            locale === option
              ? 'bg-aurora-cyan/20 text-aurora-cyan'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
