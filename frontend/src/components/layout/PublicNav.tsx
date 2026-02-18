'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const navLinks = [
  { href: '/artists', label: 'Artists' },
  { href: '/about', label: 'About' },
  { href: '/curated', label: 'Curated' },
  { href: '/contact', label: 'Contact' },
];

export function PublicNav() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl font-bold text-aurora tracking-wider">
          SAURORAA
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 tracking-wide uppercase"
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm px-5 py-2 rounded-lg border border-aurora-cyan/30 text-aurora-cyan hover:bg-aurora-cyan/10 transition-all duration-200"
          >
            Agency
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-[var(--border-color)]"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="text-lg font-display tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                <ThemeToggle />
                <Link href="/login" className="text-aurora-cyan text-sm">Agency Login</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
