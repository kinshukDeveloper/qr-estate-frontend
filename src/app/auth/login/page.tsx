'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('from') || '/dashboard';
  const expired = searchParams.get('expired');

  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    return () => clearError();
  }, []);

  async function onSubmit(data: LoginForm) {
    await login(data, redirectTo);
  }

  return (
    <div className="animate-fade-in">
      {/* Expired session notice */}
      {expired && (
        <div className="mb-6 px-4 py-3 bg-[rgba(255,184,48,0.08)] border border-[rgba(255,184,48,0.25)] text-[#FFB830] text-sm">
          Your session expired. Please log in again.
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
        <p className="text-[#7A95AE] text-sm">
          Sign in to manage your listings and QR codes
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-[rgba(255,77,106,0.08)] border border-[rgba(255,77,106,0.25)] text-[#FF4D6A] text-sm flex items-start gap-2">
          <span className="flex-shrink-0 mt-0.5">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            autoComplete="current-password"
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
          <div className="flex justify-end mt-1.5">
            <Link href="/auth/forgot-password" className="text-xs text-[#4A6580] hover:text-[#00D4C8] transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          size="lg"
          className="mt-2"
        >
          Sign In
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-[#1A2D40]" />
        <span className="text-xs text-[#4A6580]">OR</span>
        <div className="flex-1 h-px bg-[#1A2D40]" />
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-[#7A95AE]">
        New to QR Estate?{' '}
        <Link href="/auth/register" className="text-[#00D4C8] font-semibold hover:underline">
          Create an account
        </Link>
      </p>

      {/* Trust indicators */}
      <div className="mt-8 pt-6 border-t border-[#1A2D40] grid grid-cols-3 gap-4">
        {[
          { icon: '🔒', label: 'Secure login' },
          { icon: '📋', label: 'RERA compliant' },
          { icon: '🇮🇳', label: 'Made for India' },
        ].map(({ icon, label }) => (
          <div key={label} className="text-center">
            <div className="text-lg mb-1">{icon}</div>
            <div className="text-[10px] text-[#4A6580] tracking-wide uppercase">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
