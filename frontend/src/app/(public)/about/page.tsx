'use client';

import { motion } from 'framer-motion';
import { TextReveal } from '@/components/effects/TextReveal';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-24">
      {/* Vision */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-32"
      >
        <p className="text-sm uppercase tracking-[0.3em] text-aurora-cyan mb-6 font-mono">Our Vision</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] mb-12">
          <TextReveal>Redefining Artist Management for the Electronic Music Era</TextReveal>
        </h1>
        <div className="grid md:grid-cols-2 gap-12">
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            Sauroraa Agency was born from a simple observation: the electronic music industry
            deserves a management platform that matches the innovation and creativity of its artists.
          </p>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            We combine cutting-edge technology with deep industry expertise to provide
            artists, managers, and promoters with an unparalleled professional experience.
          </p>
        </div>
      </motion.section>

      {/* Manifesto */}
      <section className="mb-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-aurora-cyan via-aurora-violet to-aurora-green rounded-full" />
          <div className="pl-12 space-y-8">
            <p className="text-sm uppercase tracking-[0.3em] text-aurora-violet mb-6 font-mono">Manifesto</p>
            {[
              'We believe in the power of sound to transform moments into memories.',
              'We curate — not collect. Every artist on our roster is chosen for their unique vision.',
              'We build bridges between artists and stages, between creativity and audience.',
              'We invest in technology that empowers, not replaces, human connection.',
              'We operate with transparency, integrity, and an unwavering commitment to excellence.',
            ].map((text, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-xl md:text-2xl font-display font-light text-[var(--text-secondary)] leading-relaxed"
              >
                {text}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Positioning */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm uppercase tracking-[0.3em] text-aurora-green mb-6 font-mono">Our Position</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-12">
            Where Art Meets Strategy
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Curated Excellence', desc: 'We handpick artists who push boundaries and define the sound of tomorrow.' },
              { title: 'Global Reach', desc: 'From Brussels to Berlin, Ibiza to Tokyo — our network spans the world.' },
              { title: 'Data-Driven', desc: 'Smart analytics and intelligent tools that give our artists a competitive edge.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]"
              >
                <h3 className="font-display text-lg font-semibold mb-3">{item.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
