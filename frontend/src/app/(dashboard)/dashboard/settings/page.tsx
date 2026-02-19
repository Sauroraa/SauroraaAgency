'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Settings, User, Lock, Palette } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useToastStore } from '@/stores/toastStore';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const hydrateUser = useAuthStore((s) => s.hydrateUser);
  const { theme, toggleTheme } = useThemeStore();
  const addToast = useToastStore((s) => s.addToast);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [vatNumber, setVatNumber] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setAvatarUrl(user?.avatarUrl || '');
    setBirthDate(user?.birthDate ? String(user.birthDate).slice(0, 10) : '');
    setPhone(user?.phone || '');
    setAddressLine1(user?.addressLine1 || '');
    setAddressLine2(user?.addressLine2 || '');
    setPostalCode(user?.postalCode || '');
    setCity(user?.city || '');
    setCountry(user?.country || '');
    setCompanyName(user?.companyName || '');
    setVatNumber(user?.vatNumber || '');
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      const firstNameTrimmed = firstName.trim();
      const lastNameTrimmed = lastName.trim();
      const avatarUrlTrimmed = avatarUrl.trim();

      if (!firstNameTrimmed || !lastNameTrimmed) {
        throw new Error('missing_name');
      }

      const res = await api.patch('/auth/profile', {
        firstName: firstNameTrimmed,
        lastName: lastNameTrimmed,
        ...(avatarUrlTrimmed ? { avatarUrl: avatarUrlTrimmed } : {}),
        birthDate: birthDate || undefined,
        phone: phone.trim() || undefined,
        addressLine1: addressLine1.trim() || undefined,
        addressLine2: addressLine2.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        companyName: companyName.trim() || undefined,
        vatNumber: vatNumber.trim() || undefined,
      });
      return res.data.data || res.data;
    },
    onSuccess: (updatedUser) => {
      hydrateUser(updatedUser);
      addToast('success', 'Profil mis à jour');
    },
    onError: (error: any) => {
      if (error?.message === 'missing_name') {
        addToast('warning', 'Prénom et nom sont requis');
        return;
      }
      addToast('error', 'Erreur lors de la mise à jour du profil');
    },
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
    },
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast('success', 'Mot de passe mis à jour, reconnecte-toi');
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.assign('/login');
        }, 800);
      }
    },
    onError: () => {
      addToast('error', 'Impossible de changer le mot de passe');
    },
  });

  const onSubmitPassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('warning', 'Complète tous les champs mot de passe');
      return;
    }
    if (newPassword.length < 8) {
      addToast('warning', 'Le nouveau mot de passe doit contenir 8 caractères minimum');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('warning', 'La confirmation du mot de passe ne correspond pas');
      return;
    }
    changePassword.mutate();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Settings size={24} /> Settings
        </h1>
      </div>

      {/* Profile */}
      <Card>
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><User size={16} /> Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <Input label="Date of Birth" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Address" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} className="md:col-span-2" />
          <Input label="Address Line 2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className="md:col-span-2" />
          <Input label="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
          <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
          <Input label="Company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          <Input label="VAT Number" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} />
          <Input label="Avatar URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="md:col-span-2" />
          <Input label="Email" type="email" value={user?.email || ''} disabled className="md:col-span-2" />
        </div>
        <div className="mt-4">
          <Button isLoading={updateProfile.isPending} onClick={() => updateProfile.mutate()}>Save Changes</Button>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Palette size={16} /> Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-[var(--text-muted)]">Current: {theme}</p>
          </div>
          <Button variant="secondary" onClick={toggleTheme}>
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
        </div>
      </Card>

      {/* Security */}
      <Card>
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Lock size={16} /> Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-[var(--text-muted)]">Add an extra layer of security (setup screen next)</p>
            </div>
            <Button variant="secondary" size="sm" disabled>Enable 2FA</Button>
          </div>
          <div className="pt-4 border-t border-[var(--border-color)]">
            <p className="text-sm font-medium mb-3">Change Password</p>
            <div className="space-y-3 max-w-sm">
              <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <Button isLoading={changePassword.isPending} onClick={onSubmitPassword}>Update Password</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
