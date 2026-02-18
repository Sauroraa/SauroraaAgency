'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { publicApi } from '@/lib/api';
import { useI18n } from '@/hooks/useI18n';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const addToast = useToastStore((s) => s.addToast);
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await publicApi.post('/auth/login', { email, password });
      const result = data.data || data;

      if (result.requires2FA) {
        router.push(`/verify-2fa?userId=${result.userId}`);
        return;
      }

      setAuth(result.user, result.accessToken, result.refreshToken);
      addToast('success', `${t.auth.welcomeBack}, ${result.user.firstName}!`);
      router.replace('/dashboard');
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
          window.location.assign('/dashboard');
        }
      }, 150);
    } catch {
      addToast('error', t.auth.invalidCredentials);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <Link href="/" className="font-display text-3xl font-bold text-aurora">SAURORAA</Link>
        <p className="text-sm text-[var(--text-muted)] mt-2">{t.auth.platform}</p>
      </div>

      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-8">
        <h2 className="font-display text-xl font-semibold mb-6">{t.auth.signIn}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t.auth.email}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />

          <div className="relative">
            <Input
              label={t.auth.password}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="flex items-center justify-end">
            <Link href="/forgot-password" className="text-xs text-aurora-cyan hover:underline">
              {t.auth.forgotPassword}
            </Link>
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            <LogIn size={16} /> {t.auth.signIn}
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-[var(--text-muted)] mt-6">
        {t.auth.invitationOnly}{' '}
        <Link href="/" className="text-aurora-cyan hover:underline">{t.auth.backToSite}</Link>
      </p>
    </motion.div>
  );
}
