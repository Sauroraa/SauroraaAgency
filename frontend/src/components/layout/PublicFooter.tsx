import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl font-bold text-aurora mb-4">SAURORAA</h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-md">
              Premium electronic music artist management. We curate exceptional talent
              and deliver unforgettable experiences worldwide.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider mb-4">Navigate</h4>
            <div className="flex flex-col gap-3">
              <Link href="/artists" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Artists</Link>
              <Link href="/about" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">About</Link>
              <Link href="/curated" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Curated</Link>
              <Link href="/contact" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider mb-4">Agency</h4>
            <div className="flex flex-col gap-3">
              <Link href="/login" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Login</Link>
              <a href="mailto:info@sauroraa.be" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">info@sauroraa.be</a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} Sauroraa Agency. All rights reserved.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Brussels, Belgium
          </p>
        </div>
      </div>
    </footer>
  );
}
