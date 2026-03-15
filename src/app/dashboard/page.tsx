'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { listingsAPI } from '@/lib/listings';
import { Home, QrCode, Eye, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';



export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ active: '0', draft: '0', sold: '0', total: '0', total_views: '0' });

  useEffect(() => {
    listingsAPI.getStats().then(res => setStats(res.data.data.stats)).catch(() => { });
  }, []);


  const STATS = [
    { label: 'Active Listings', value: stats.active, max: '5', icon: Home, color: '#00D4C8', hint: `${5 - parseInt(stats.active)} remaining on Free plan` },
    { label: 'QR Codes', value: stats.active, icon: QrCode, color: '#FFB830', hint: 'Generated so far' },
    { label: 'Total Views', value: stats.total_views, icon: Eye, color: '#A78BFA', hint: 'Across all listings' },
    { label: 'Draft Listings', value: stats.draft, icon: TrendingUp, color: '#2ECC8A', hint: 'Saved as draft' },
  ];

  const QUICK_ACTIONS = [
    {
      label: 'Add Listing',
      description: 'Create a new property listing',
      href: '/dashboard/listings/new',
      icon: Home,
      color: '#00D4C8',
    },
    {
      label: 'Generate QR',
      description: 'Create a QR code for a listing',
      href: '/dashboard/qr',
      icon: QrCode,
      color: '#FFB830',
    },
  ];

  const NEXT_STEPS = [
    { step: '1', label: 'Add your first listing', done: false, href: '/dashboard/listings/new' },
    { step: '2', label: 'Generate a QR code', done: false, href: '/dashboard/qr' },
    { step: '3', label: 'Share QR on property boards', done: false, href: '#' },
    { step: '4', label: 'Track your first scan', done: false, href: '/dashboard/analytics' },
  ];
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'Agent';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-black text-white">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-[#7A95AE] text-sm mt-1">
          Here&apos;s your QR Estate overview
          {user?.rera_number && (
            <span className="ml-2 text-[10px] font-bold tracking-widest text-[#00D4C8] bg-[rgba(0,212,200,0.08)] px-2 py-0.5 uppercase">
              RERA: {user.rera_number}
            </span>
          )}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map(({ label, value, max, icon: Icon, color, hint }) => (
          <div key={label} className="bg-[#111C28] border border-[#1A2D40] p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center justify-center w-9 h-9" style={{ background: `${color}15` }}>
                <Icon size={18} style={{ color }} />
              </div>
              {max && (
                <span className="text-[10px] text-[#4A6580] font-mono">/ {max}</span>
              )}
            </div>
            <div className="mb-1 text-3xl font-black text-white">{value}</div>
            <div className="text-xs font-semibold text-white mb-0.5">{label}</div>
            <div className="text-[11px] text-[#4A6580]">{hint}</div>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Getting started checklist */}
        <div className="bg-[#111C28] border border-[#1A2D40] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[10px] font-bold tracking-widest text-[#00D4C8] uppercase mb-1">Setup Guide</div>
              <h2 className="text-base font-bold text-white">Get started in 4 steps</h2>
            </div>
            <div className="text-xs text-[#4A6580] font-mono">0 / 4</div>
          </div>
          <div className="space-y-3">
            {NEXT_STEPS.map(({ step, label, done, href }) => (
              <Link key={step} href={href} className="flex items-center gap-3 group">
                <div className={`w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 border transition-colors ${done
                    ? 'bg-[#2ECC8A] border-[#2ECC8A] text-black'
                    : 'border-[#1A2D40] text-[#4A6580] group-hover:border-[#00D4C8] group-hover:text-[#00D4C8]'
                  }`}>
                  {done ? '✓' : step}
                </div>
                <span className={`text-sm transition-colors ${done ? 'text-[#4A6580] line-through' : 'text-[#7A95AE] group-hover:text-white'
                  }`}>
                  {label}
                </span>
                {!done && (
                  <ArrowRight size={14} className="ml-auto text-[#1A2D40] group-hover:text-[#00D4C8] transition-colors" />
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-[#FFB830] uppercase mb-1">Quick Actions</div>
            <h2 className="text-base font-bold text-white">What do you want to do?</h2>
          </div>
          <div className="space-y-3">
            {QUICK_ACTIONS.map(({ label, description, href, icon: Icon, color }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-4 bg-[#111C28] border border-[#1A2D40] p-4 hover:border-[#1A2D40] group transition-all hover:-translate-y-0.5"
                style={{ ['--hover-color' as string]: color }}
              >
                <div
                  className="flex items-center justify-center flex-shrink-0 w-10 h-10"
                  style={{ background: `${color}15` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-white group-hover:text-[#00D4C8] transition-colors">{label}</div>
                  <div className="text-xs text-[#4A6580]">{description}</div>
                </div>
                <ArrowRight size={16} className="text-[#1A2D40] group-hover:text-[#00D4C8] transition-colors flex-shrink-0" />
              </Link>
            ))}

            {/* Feature 2 teaser */}
            <div className="bg-[#0D1821] border border-dashed border-[#1A2D40] p-4 text-center">
              <div className="text-xs text-[#4A6580] mb-1">Feature 2 coming next</div>
              <div className="text-sm font-bold text-[#7A95AE]">Property Listing CRUD</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 1 complete banner */}
      <div className="bg-[rgba(0,212,200,0.04)] border border-[rgba(0,212,200,0.15)] p-5 flex items-center gap-4">
        <div className="text-2xl">🎉</div>
        <div>
          <div className="text-sm font-bold text-[#00D4C8] mb-0.5">Feature 1 Complete — Auth System Running</div>
          <div className="text-xs text-[#7A95AE]">
            Register ✓ Login ✓ JWT tokens ✓ Protected routes ✓ Logout ✓
          </div>
        </div>
        <div className="ml-auto text-xs font-bold text-[#4A6580] hidden sm:block">Day 7 of 67</div>
      </div>
    </div>
  );
}
