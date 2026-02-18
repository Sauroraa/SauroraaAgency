'use client';

import Link from 'next/link';
import { useI18n } from '@/hooks/useI18n';

export function PublicFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl font-bold text-aurora mb-4">SAURORAA</h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-md">
              {t.footer.description}
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider mb-4">{t.footer.navigate}</h4>
            <div className="flex flex-col gap-3">
              <Link href="/artists" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">{t.nav.artists}</Link>
              <Link href="/about" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">{t.nav.about}</Link>
              <Link href="/curated" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">{t.nav.curated}</Link>
              <Link href="/contact" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">{t.nav.contact}</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider mb-4">{t.footer.agency}</h4>
            <div className="flex flex-col gap-3">
              <Link href="/login" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">{t.footer.login}</Link>
              <a href="mailto:info@sauroraa.be" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">info@sauroraa.be</a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} Sauroraa Agency. {t.footer.rights}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {t.footer.location}
          </p>
        </div>
      </div>
    </footer>
  );
}
