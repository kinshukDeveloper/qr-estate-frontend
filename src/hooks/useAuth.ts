'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import type { RegisterPayload, LoginPayload } from '@/types';
import axios from 'axios';

export function useAuth() {
  const router = useRouter();
  const { setAuth, clearAuth, user, isAuthenticated, refreshToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── REGISTER ──────────────────────────────────────────────────────────────
  async function register(payload: RegisterPayload) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authAPI.register(payload);
      const { user, accessToken, refreshToken } = res.data.data;

      setAuth(user, accessToken, refreshToken);

      // Set a cookie flag so Next.js middleware can detect auth state
      document.cookie = `qr_estate_auth=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

      router.push('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (data?.errors?.length) {
          setError(data.errors.map((e: { message: string }) => e.message).join(' · '));
        } else {
          setError(data?.message || 'Registration failed. Please try again.');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  async function login(payload: LoginPayload, redirectTo = '/dashboard') {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authAPI.login(payload);
      const { user, accessToken, refreshToken } = res.data.data;

      setAuth(user, accessToken, refreshToken);

      // Set cookie for middleware route protection
      document.cookie = `qr_estate_auth=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

      router.push(redirectTo);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          setError('Invalid email or password.');
        } else if (status === 403) {
          setError('Your account has been deactivated. Contact support.');
        } else {
          setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  async function logout() {
    setIsLoading(true);
    try {
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch {
      // Logout silently even if API call fails
    } finally {
      clearAuth();
      // Clear the auth cookie
      document.cookie = 'qr_estate_auth=; path=/; max-age=0';
      router.push('/auth/login');
      setIsLoading(false);
    }
  }

  function clearError() {
    setError(null);
  }

  return { register, login, logout, isLoading, error, clearError, user, isAuthenticated };
}
