'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { ArrowDown, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/hooks/useI18n';

export function HeroSection() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const { t } = useI18n();

  const toggleSound = async () => {
    if (!audioRef.current) return;
    if (soundOn) {
      audioRef.current.pause();
      setSoundOn(false);
      return;
    }
    try {
      await audioRef.current.play();
      setSoundOn(true);
    } catch {
      setSoundOn(false);
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-dark-900">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/placeholder/artist-1.webp"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/50 via-transparent to-dark-900" />
        <div className="absolute inset-0 bg-aurora-gradient opacity-30" />
      </div>

      <audio ref={audioRef} src="/audio/ambient.mp3" loop preload="none" />
      <button
        onClick={toggleSound}
        className="absolute right-6 top-24 z-20 inline-flex items-center gap-2 rounded-full border border-white/20 bg-dark-900/50 px-3 py-1.5 text-xs text-white/80 backdrop-blur hover:text-aurora-cyan"
      >
        {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
        {soundOn ? t.home.ambientOn : t.home.ambientOff}
      </button>

      <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
          <p className="text-sm uppercase tracking-[0.3em] text-aurora-cyan mb-6 font-mono">
            {t.home.heroTag}
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.19, 1, 0.22, 1] }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-8"
        >
          <span className="text-aurora">SAURORAA</span>
          <br />
          <span className="text-[var(--text-secondary)] text-3xl md:text-5xl lg:text-6xl font-light">
            AGENCY
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          {t.home.heroSubtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/artists">
            <Button size="lg">
              {t.home.discoverArtists}
            </Button>
          </Link>
          <Link href="/#book-now">
            <Button variant="secondary" size="lg">
              {t.home.bookNow}
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ArrowDown size={20} className="text-[var(--text-muted)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
