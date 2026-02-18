'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastStore } from '@/stores/toastStore';
import { publicApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await publicApi.post('/auth/forgot-password', { email });
      setSent(true);
      addToast('success', 'Reset link sent to your email');
    } catch {
      addToast('error', 'Failed to send reset link. Please check your email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="font-display text-3xl font-bold text-aurora">SAURORAA</Link>
        <p className="text-sm text-[var(--text-muted)] mt-2">Reset your password</p>
      </div>

      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-8">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-aurora-cyan/10 flex items-center justify-center mx-auto mb-4">
              <Mail size={24} className="text-aurora-cyan" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">Check your email</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              We sent a password reset link to <strong>{email}</strong>.
              The link will expire in 1 hour.
            </p>
            <Button variant="ghost" onClick={() => setSent(false)}>Try another email</Button>
          </div>
        ) : (
          <>
            <h2 className="font-display text-xl font-semibold mb-2">Forgot Password</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                <Mail size={16} /> Send Reset Link
              </Button>
            </form>
          </>
        )}
      </div>

      <p className="text-center text-xs text-[var(--text-muted)] mt-6">
        <Link href="/login" className="text-aurora-cyan hover:underline flex items-center justify-center gap-1">
          <ArrowLeft size={12} /> Back to login
        </Link>
      </p>
    </motion.div>
  );
}
