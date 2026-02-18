'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { publicApi } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const setAuth = useAuthStore((s) => s.setAuth);
  const addToast = useToastStore((s) => s.addToast);

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.includes('@')) e.email = 'Valid email is required';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const { data } = await publicApi.post('/auth/register', {
        ...form, invitationToken: token,
      });
      const result = data.data || data;
      setAuth(result.user, result.accessToken, result.refreshToken);
      addToast('success', 'Account created successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      addToast('error', typeof msg === 'string' ? msg : msg[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="font-display text-3xl font-bold text-aurora">SAURORAA</Link>
        <p className="text-sm text-[var(--text-muted)] mt-2">Create your account</p>
      </div>

      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-8">
        <h2 className="font-display text-xl font-semibold mb-6">Register</h2>

        {!token && (
          <div className="rounded-lg bg-aurora-violet/10 border border-aurora-violet/20 p-4 mb-6">
            <p className="text-sm text-[var(--text-secondary)]">
              Registration requires an invitation link. Contact your administrator if you don&apos;t have one.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} error={errors.firstName} required />
            <Input label="Last Name" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} error={errors.lastName} required />
          </div>

          <Input label="Email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="your@email.com" error={errors.email} required />

          <div className="relative">
            <Input label="Password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => updateField('password', e.target.value)} placeholder="Min 8 characters" error={errors.password} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Input label="Confirm Password" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} placeholder="Repeat password" error={errors.confirmPassword} required />

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            <UserPlus size={16} /> Create Account
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-[var(--text-muted)] mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-aurora-cyan hover:underline">Sign in</Link>
      </p>
    </motion.div>
  );
}
