'use client';

import { useState } from 'react';
import { Suspense } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { publicApi } from '@/lib/api';

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailFromQuery = searchParams.get('email') || '';
  const setAuth = useAuthStore((s) => s.setAuth);
  const addToast = useToastStore((s) => s.addToast);

  const [inviteRole, setInviteRole] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingInvite, setIsVerifyingInvite] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    city: '',
    country: '',
    companyName: '',
    vatNumber: '',
  });

  useEffect(() => {
    if (!emailFromQuery) return;
    setForm((prev) => ({ ...prev, email: emailFromQuery }));
  }, [emailFromQuery]);

  useEffect(() => {
    if (!token) return;
    setIsVerifyingInvite(true);
    publicApi
      .get(`/invitations/verify/${token}`)
      .then((res) => {
        const invitation = res.data?.data || res.data;
        if (invitation?.email) {
          setForm((prev) => ({ ...prev, email: invitation.email }));
        }
        if (invitation?.role) {
          setInviteRole(invitation.role);
        }
      })
      .catch(() => {
        addToast('error', 'Invitation invalide ou expirée');
      })
      .finally(() => {
        setIsVerifyingInvite(false);
      });
  }, [token, addToast]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.includes('@')) e.email = 'Valid email is required';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.birthDate) e.birthDate = 'Birth date is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (!form.addressLine1.trim()) e.addressLine1 = 'Address is required';
    if (!form.postalCode.trim()) e.postalCode = 'Postal code is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.country.trim()) e.country = 'Country is required';
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
          {inviteRole && (
            <p className="text-xs text-aurora-cyan uppercase tracking-wide">Role invite: {inviteRole}</p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} error={errors.firstName} required />
            <Input label="Last Name" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} error={errors.lastName} required />
          </div>

          <Input label="Email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="your@email.com" error={errors.email} required disabled={Boolean(token)} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Date of Birth" type="date" value={form.birthDate} onChange={(e) => updateField('birthDate', e.target.value)} error={errors.birthDate} required />
            <Input label="Phone" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} error={errors.phone} required />
          </div>

          <Input label="Address" value={form.addressLine1} onChange={(e) => updateField('addressLine1', e.target.value)} error={errors.addressLine1} required />
          <Input label="Address Line 2" value={form.addressLine2} onChange={(e) => updateField('addressLine2', e.target.value)} />

          <div className="grid grid-cols-3 gap-4">
            <Input label="Postal Code" value={form.postalCode} onChange={(e) => updateField('postalCode', e.target.value)} error={errors.postalCode} required />
            <Input label="City" value={form.city} onChange={(e) => updateField('city', e.target.value)} error={errors.city} required />
            <Input label="Country" value={form.country} onChange={(e) => updateField('country', e.target.value)} error={errors.country} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Company (optional)" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} />
            <Input label="VAT Number (optional)" value={form.vatNumber} onChange={(e) => updateField('vatNumber', e.target.value)} />
          </div>

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

      {isVerifyingInvite && (
        <p className="text-xs text-[var(--text-muted)] mt-3 text-center">Verifying invitation...</p>
      )}

      <p className="text-center text-xs text-[var(--text-muted)] mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-aurora-cyan hover:underline">Sign in</Link>
      </p>
    </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md" />}>
      <RegisterPageContent />
    </Suspense>
  );
}
