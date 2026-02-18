'use client';

import { useState } from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastStore } from '@/stores/toastStore';
import { publicApi } from '@/lib/api';

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const addToast = useToastStore((s) => s.addToast);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    try {
      await publicApi.post('/auth/reset-password', { token, password });
      addToast('success', 'Password reset successfully! Please sign in.');
      router.push('/login');
    } catch {
      addToast('error', 'Reset link is invalid or expired. Please request a new one.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="font-display text-3xl font-bold text-aurora">SAURORAA</Link>
        <p className="text-sm text-[var(--text-muted)] mt-2">Set your new password</p>
      </div>

      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-8">
        <h2 className="font-display text-xl font-semibold mb-2">Reset Password</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">Choose a strong password for your account.</p>

        {!token && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 mb-6">
            <p className="text-sm text-red-400">
              Invalid reset link. Please request a new one from the{' '}
              <Link href="/forgot-password" className="underline">forgot password page</Link>.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              error={errors.password}
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            error={errors.confirmPassword}
            required
          />

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={!token}>
            <Lock size={16} /> Reset Password
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-[var(--text-muted)] mt-6">
        Remember your password?{' '}
        <Link href="/login" className="text-aurora-cyan hover:underline">Sign in</Link>
      </p>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md" />}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
