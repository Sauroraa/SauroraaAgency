'use client';

import Link from 'next/link';
import { useI18n } from '@/hooks/useI18n';
import { Mail, MapPin, Building2, ShieldCheck } from 'lucide-react';

export function PublicFooter() {
  const { t, locale } = useI18n();

  const legalCopy = {
    fr: {
      legalTitle: 'Informations légales',
      company: 'SAURORAA SNC',
      companyNumber: 'N° 1031.598.463',
      region: 'Région de Liège, Belgique',
      booking: 'booking@sauroraa.be',
      contact: 'contact@sauroraa.be',
      legalLink: 'Mentions légales',
      policyText: 'Protection des données, conditions et conformité disponibles sur la page légale.',
    },
    en: {
      legalTitle: 'Legal information',
      company: 'SAURORAA SNC',
      companyNumber: 'No. 1031.598.463',
      region: 'Liège Region, Belgium',
      booking: 'booking@sauroraa.be',
      contact: 'contact@sauroraa.be',
      legalLink: 'Legal notice',
      policyText: 'Data protection, terms and compliance details are available on the legal page.',
    },
    nl: {
      legalTitle: 'Juridische informatie',
      company: 'SAURORAA SNC',
      companyNumber: 'Nr. 1031.598.463',
      region: 'Regio Luik, België',
      booking: 'booking@sauroraa.be',
      contact: 'contact@sauroraa.be',
      legalLink: 'Juridische vermeldingen',
      policyText: 'Gegevensbescherming, voorwaarden en compliance vind je op de juridische pagina.',
    },
  }[locale];

  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_0%,rgba(0,212,255,0.25),transparent_40%),radial-gradient(circle_at_80%_100%,rgba(123,47,190,0.2),transparent_42%)]" />
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-10 relative z-10">
          <div className="lg:col-span-2">
            <h3 className="font-display text-2xl font-bold text-aurora mb-4">SAURORAA</h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-md">
              {t.footer.description}
            </p>
          </div>

          <div className="lg:col-span-1">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider mb-4">{t.footer.navigate}</h4>
            <div className="flex flex-col gap-3">
              <Link href="/artists" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">{t.nav.artists}</Link>
              <Link href="/about" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">{t.nav.about}</Link>
              <Link href="/curated" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">{t.nav.curated}</Link>
              <Link href="/contact" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">{t.nav.contact}</Link>
            </div>
          </div>

          <div className="lg:col-span-1">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider mb-4">{t.footer.agency}</h4>
            <div className="flex flex-col gap-3">
              <Link href="/login" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">{t.footer.login}</Link>
              <a href={`mailto:${legalCopy.booking}`} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">{legalCopy.booking}</a>
              <a href={`mailto:${legalCopy.contact}`} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">{legalCopy.contact}</a>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-aurora-cyan/20 bg-dark-900/40 p-5 backdrop-blur">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider mb-4 text-aurora-cyan">{legalCopy.legalTitle}</h4>
            <div className="space-y-2 text-sm text-[var(--text-secondary)]">
              <p className="flex items-center gap-2"><Building2 size={14} className="text-aurora-cyan" /> {legalCopy.company}</p>
              <p className="flex items-center gap-2"><ShieldCheck size={14} className="text-aurora-cyan" /> {legalCopy.companyNumber}</p>
              <p className="flex items-center gap-2"><MapPin size={14} className="text-aurora-cyan" /> {legalCopy.region}</p>
              <p className="flex items-center gap-2"><Mail size={14} className="text-aurora-cyan" /> {legalCopy.booking}</p>
              <p className="flex items-center gap-2"><Mail size={14} className="text-aurora-cyan" /> {legalCopy.contact}</p>
            </div>
            <p className="mt-4 text-xs text-[var(--text-muted)]">{legalCopy.policyText}</p>
            <Link href="/mentions-legales" className="mt-3 inline-flex text-sm text-aurora-cyan hover:opacity-80 transition-opacity">
              {legalCopy.legalLink}
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
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
