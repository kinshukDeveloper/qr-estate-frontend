'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Phone, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
    .optional()
    .or(z.literal('')),
  rera_number: z.string().min(3, 'Minimum 3 characters').max(50).optional().or(z.literal('')),
});

type RegisterForm = z.infer<typeof registerSchema>;

const PASSWORD_RULES = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Number', test: (v: string) => /[0-9]/.test(v) },
];

export default function RegisterPage() {
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const watchedPassword = watch('password', '');
  useEffect(() => setPasswordValue(watchedPassword || ''), [watchedPassword]);
  useEffect(() => () => clearError(), []);

  async function onSubmit(data: RegisterForm) {
    await registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone || undefined,
      rera_number: data.rera_number || undefined,
    });
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Create your account</h1>
        <p className="text-[#7A95AE] text-sm">
          Start listing properties with QR codes in minutes
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-[rgba(255,77,106,0.08)] border border-[rgba(255,77,106,0.25)] text-[#FF4D6A] text-sm flex items-start gap-2">
          <span className="flex-shrink-0 mt-0.5">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <Input
          label="Full Name"
          placeholder="Rajesh Kumar"
          autoComplete="name"
          leftIcon={<User size={16} />}
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Email */}
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Password */}
        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            autoComplete="new-password"
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#4A6580] hover:text-white transition-colors p-0.5"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            error={errors.password?.message}
            {...register('password')}
          />

          {/* Password strength indicators */}
          {passwordValue && (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {PASSWORD_RULES.map(({ label, test }) => {
                const passes = test(passwordValue);
                return (
                  <div key={label} className={`flex items-center gap-1.5 text-xs transition-colors ${passes ? 'text-[#2ECC8A]' : 'text-[#4A6580]'}`}>
                    <CheckCircle size={11} className={passes ? 'opacity-100' : 'opacity-30'} />
                    {label}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Phone */}
        <Input
          label="Mobile Number (optional)"
          type="tel"
          placeholder="9876543210"
          autoComplete="tel"
          leftIcon={
            <span className="text-xs font-bold text-[#4A6580]">+91</span>
          }
          hint="For WhatsApp lead notifications"
          error={errors.phone?.message}
          {...register('phone')}
        />

        {/* RERA */}
        <Input
          label="RERA Number (optional)"
          placeholder="RERA-PB-01-2023-001234"
          leftIcon={<FileText size={16} />}
          hint="Builds trust with buyers — displayed on your listings"
          error={errors.rera_number?.message}
          {...register('rera_number')}
        />

        {/* Terms */}
        <p className="text-xs text-[#4A6580] leading-relaxed pt-1">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="text-[#00D4C8] hover:underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-[#00D4C8] hover:underline">Privacy Policy</Link>.
        </p>

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          size="lg"
        >
          Create Account
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-[#1A2D40]" />
        <span className="text-xs text-[#4A6580]">ALREADY HAVE AN ACCOUNT?</span>
        <div className="flex-1 h-px bg-[#1A2D40]" />
      </div>

      <Link href="/auth/login">
        <Button variant="outline" fullWidth>
          Sign In Instead
        </Button>
      </Link>
    </div>
  );
}
