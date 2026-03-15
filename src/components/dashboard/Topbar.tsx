'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';

export function DashboardTopbar() {
  const { user } = useAuthStore();
  const { logout, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="h-14 bg-[#0D1821] border-b border-[#1A2D40] px-6 flex items-center justify-between flex-shrink-0">
      {/* Left: breadcrumb placeholder */}
      <div className="text-sm text-[#4A6580]">
        <span className="text-white font-medium">Dashboard</span>
      </div>

      {/* Right: actions + user */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="w-8 h-8 flex items-center justify-center text-[#4A6580] hover:text-white transition-colors relative">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF4D6A] rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 hover:bg-[rgba(255,255,255,0.04)] px-2 py-1.5 transition-colors"
          >
            {/* Avatar */}
            <div className="w-7 h-7 bg-[#00D4C8] flex items-center justify-center text-xs font-bold text-[#080F17]">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-white leading-tight">{user?.name || 'Agent'}</div>
              <div className="text-[10px] text-[#4A6580] leading-tight capitalize">{user?.role?.replace('_', ' ')}</div>
            </div>
            <ChevronDown size={14} className={`text-[#4A6580] transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-[#111C28] border border-[#1A2D40] shadow-xl z-50 animate-fade-in">
              {/* User info */}
              <div className="px-4 py-3 border-b border-[#1A2D40]">
                <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
                <div className="text-[11px] text-[#4A6580] truncate">{user?.email}</div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#7A95AE] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                >
                  <User size={14} />
                  My Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#7A95AE] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                >
                  <Settings size={14} />
                  Settings
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-[#1A2D40] py-1">
                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#FF4D6A] hover:bg-[rgba(255,77,106,0.06)] transition-colors disabled:opacity-50"
                >
                  <LogOut size={14} />
                  {isLoading ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
