'use client';

import { useState, useRef, useEffect } from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { publicApi } from '@/lib/api';

function Verify2FAPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const setAuth = useAuthStore((s) => s.setAuth);
  const addToast = useToastStore((s) => s.addToast);

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (newCode.every((d) => d) && newCode.join('').length === 6) {
      submit(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    pasted.split('').forEach((char, i) => { newCode[i] = char; });
    setCode(newCode);
    if (pasted.length === 6) submit(pasted);
  };

  const submit = async (totpCode: string) => {
    setIsLoading(true);
    try {
      const { data } = await publicApi.post('/auth/verify-2fa', { userId, code: totpCode });
      const result = data.data || data;
      setAuth(result.user, result.accessToken, result.refreshToken);
      addToast('success', `Welcome back, ${result.user.firstName}!`);
      router.push('/dashboard');
    } catch {
      addToast('error', 'Invalid code. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="font-display text-3xl font-bold text-aurora">SAURORAA</Link>
        <p className="text-sm text-[var(--text-muted)] mt-2">Two-Factor Authentication</p>
      </div>

      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-aurora-cyan/10 flex items-center justify-center mx-auto mb-4">
            <Shield size={24} className="text-aurora-cyan" />
          </div>
          <h2 className="font-display text-xl font-semibold mb-2">Verification Code</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Enter the 6-digit code from your authenticator app.
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-xl font-mono font-bold rounded-xl bg-dark-800 border border-dark-500 outline-none focus:border-aurora-cyan focus:ring-1 focus:ring-aurora-cyan/50 transition-colors"
            />
          ))}
        </div>

        <Button
          onClick={() => submit(code.join(''))}
          className="w-full"
          size="lg"
          isLoading={isLoading}
          disabled={code.some((d) => !d)}
        >
          <Shield size={16} /> Verify
        </Button>

        <p className="text-center text-xs text-[var(--text-muted)] mt-4">
          Lost access to your authenticator? Contact your administrator.
        </p>
      </div>

      <p className="text-center text-xs text-[var(--text-muted)] mt-6">
        <Link href="/login" className="text-aurora-cyan hover:underline">Back to login</Link>
      </p>
    </motion.div>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md" />}>
      <Verify2FAPageContent />
    </Suspense>
  );
}
