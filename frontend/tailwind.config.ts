import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aurora: {
          cyan: '#00d4ff',
          violet: '#7b2fbe',
          green: '#00ff88',
          pink: '#ff006e',
          blue: '#3a86ff',
        },
        dark: {
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#b8b8b8',
          300: '#8a8a8a',
          400: '#5c5c5c',
          500: '#3d3d3d',
          600: '#2a2a2a',
          700: '#1a1a1a',
          800: '#111111',
          900: '#0a0a0a',
          950: '#050505',
        },
      },
      fontFamily: {
        display: ['var(--font-clash-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-satoshi)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(123,47,190,0.1) 50%, rgba(0,255,136,0.05) 100%)',
        'aurora-gradient-strong': 'linear-gradient(135deg, rgba(0,212,255,0.3) 0%, rgba(123,47,190,0.3) 50%, rgba(0,255,136,0.15) 100%)',
      },
      animation: {
        'aurora-pulse': 'aurora-pulse 8s ease-in-out infinite',
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
      },
      keyframes: {
        'aurora-pulse': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
