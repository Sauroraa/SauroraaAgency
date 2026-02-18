'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/hooks/useI18n';
import { publicApi } from '@/lib/api';

function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function StatsCounter() {
  const { t } = useI18n();

  const { data } = useQuery({
    queryKey: ['home-public-stats'],
    queryFn: async () => {
      const res = await publicApi.get('/public/artists/stats');
      return res.data.data || res.data;
    },
  });

  const artists = Number(data?.artists ?? 0);
  const eventsBooked = Number(data?.eventsBooked ?? 0);
  const countries = Number(data?.countries ?? 0);
  const yearsActive = Number(data?.yearsActive ?? 0);

  const stats = [
    { label: t.home.statsArtists, value: artists, suffix: '' },
    { label: t.home.statsEvents, value: eventsBooked, suffix: '' },
    { label: t.home.statsCountries, value: countries, suffix: '' },
    { label: t.home.statsYears, value: yearsActive, suffix: '' },
  ];

  return (
    <section className="py-24 px-6 border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-4xl md:text-5xl font-bold text-aurora mb-2">
                <AnimatedNumber target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
