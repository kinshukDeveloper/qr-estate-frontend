'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { authAPI } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { User, Phone, FileText, LogOut } from 'lucide-react';
import axios from 'axios';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number').optional().or(z.literal('')),
  rera_number: z.string().min(3).max(50).optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      rera_number: user?.rera_number || '',
    },
  });

  async function onSave(data: ProfileForm) {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await authAPI.updateProfile({
        name: data.name,
        phone: data.phone || undefined,
        rera_number: data.rera_number || undefined,
      });
      updateUser(res.data.data.user);
      setSaveMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setSaveMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update.' });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-[#7A95AE] text-sm mt-1">Manage your profile and account</p>
      </div>

      {/* Profile section */}
      <div className="bg-[#111C28] border border-[#1A2D40] p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#1A2D40]">
          <div className="w-14 h-14 bg-[#00D4C8] flex items-center justify-center text-xl font-black text-[#080F17]">
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <div className="font-bold text-white">{user?.name}</div>
            <div className="text-sm text-[#7A95AE]">{user?.email}</div>
            <div className="text-xs text-[#4A6580] mt-0.5 capitalize">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>

        {saveMsg && (
          <div className={`mb-5 px-4 py-3 text-sm border ${
            saveMsg.type === 'success'
              ? 'bg-[rgba(46,204,138,0.06)] border-[rgba(46,204,138,0.2)] text-[#2ECC8A]'
              : 'bg-[rgba(255,77,106,0.06)] border-[rgba(255,77,106,0.2)] text-[#FF4D6A]'
          }`}>
            {saveMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <Input
            label="Full Name"
            leftIcon={<User size={16} />}
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Mobile Number"
            type="tel"
            leftIcon={<span className="text-xs font-bold text-[#4A6580]">+91</span>}
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="RERA Number"
            leftIcon={<FileText size={16} />}
            hint="Displayed on your public listings"
            error={errors.rera_number?.message}
            {...register('rera_number')}
          />

          <div className="pt-2">
            <Button type="submit" isLoading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Account section */}
      <div className="bg-[#111C28] border border-[#1A2D40] p-6">
        <h2 className="text-sm font-bold text-white mb-1">Account</h2>
        <p className="text-xs text-[#4A6580] mb-4">Manage your session</p>
        <Button variant="danger" onClick={logout} className="flex items-center gap-2">
          <LogOut size={14} />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
