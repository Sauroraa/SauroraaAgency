'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastStore } from '@/stores/toastStore';
import { publicApi } from '@/lib/api';
import { useI18n } from '@/hooks/useI18n';

export default function ForgotPasswordPage() {
  const addToast = useToastStore((s) => s.addToast);
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await publicApi.post('/auth/forgot-password', { email });
      setSent(true);
      addToast('success', t.auth.resetSent);
    } catch {
      addToast('error', t.auth.resetError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="font-display text-3xl font-bold text-aurora">SAURORAA</Link>
        <p className="text-sm text-[var(--text-muted)] mt-2">{t.auth.resetPassword}</p>
      </div>

      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-8">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-aurora-cyan/10 flex items-center justify-center mx-auto mb-4">
              <Mail size={24} className="text-aurora-cyan" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">{t.auth.checkEmail}</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              {t.auth.resetSent} <strong>{email}</strong>.
            </p>
            <Button variant="ghost" onClick={() => setSent(false)}>{t.auth.tryAnotherEmail}</Button>
          </div>
        ) : (
          <>
            <h2 className="font-display text-xl font-semibold mb-2">{t.auth.forgotTitle}</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              {t.auth.forgotText}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label={t.auth.email} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                <Mail size={16} /> {t.auth.sendReset}
              </Button>
            </form>
          </>
        )}
      </div>

      <p className="text-center text-xs text-[var(--text-muted)] mt-6">
        <Link href="/login" className="text-aurora-cyan hover:underline flex items-center justify-center gap-1">
          <ArrowLeft size={12} /> {t.auth.backToLogin}
        </Link>
      </p>
    </motion.div>
  );
}
