'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Home,
  QrCode,
  BarChart2,
  MessageSquare,
  CreditCard,
  Settings,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Listings',
    href: '/dashboard/listings',
    icon: Home,
    badge: null,
    comingSoon: false,
  },
  {
    label: 'QR Codes',
    href: '/dashboard/qr',
    icon: QrCode,
    comingSoon: false,
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart2,
    comingSoon: false,
  },
  {
    label: 'Leads',
    href: '/dashboard/leads',
    icon: MessageSquare,
    comingSoon: false,
  },
  {
    label: 'QR Health',
    href: '/dashboard/health',
    icon: ShieldCheck,
    comingSoon: false,
  },
  {
    label: 'Billing',
    href: '/dashboard/billing',
    icon: CreditCard,
    comingSoon: false,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    comingSoon: false,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  function isActive(item: typeof NAV_ITEMS[0]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <aside className="w-64 bg-[#0D1821] border-r border-[#1A2D40] flex flex-col flex-shrink-0 hidden lg:flex">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#1A2D40]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 border-2 border-[#00D4C8] flex items-center justify-center flex-shrink-0">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-1.5 h-1.5 bg-[#00D4C8]" />
              <div className="w-1.5 h-1.5 border border-[#00D4C8]" />
              <div className="w-1.5 h-1.5 border border-[#00D4C8]" />
              <div className="w-1.5 h-1.5 bg-[#00D4C8]" />
            </div>
          </div>
          <span className="font-bold text-white text-sm tracking-wide">QR Estate</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="text-[9px] font-bold tracking-[2px] text-[#4A6580] uppercase px-3 pb-2">
          Main Menu
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <Link
              key={item.href}
              href={item.comingSoon ? '#' : item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150 group',
                active
                  ? 'bg-[rgba(0,212,200,0.08)] text-[#00D4C8] border-r-2 border-[#00D4C8] -mr-3 pr-[10px]'
                  : 'text-[#7A95AE] hover:text-white hover:bg-[rgba(255,255,255,0.03)]',
                item.comingSoon && 'opacity-50 cursor-not-allowed'
              )}
              onClick={(e) => item.comingSoon && e.preventDefault()}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="font-medium flex-1">{item.label}</span>
              {item.comingSoon && (
                <span className="text-[9px] font-bold tracking-widest text-[#4A6580] bg-[#111C28] px-1.5 py-0.5 uppercase">
                  Soon
                </span>
              )}
              {active && !item.comingSoon && (
                <ChevronRight size={14} className="opacity-50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Plan badge */}
      <div className="px-4 py-4 border-t border-[#1A2D40]">
        <Link href="/dashboard/billing">
          <div className="bg-[rgba(255,184,48,0.06)] border border-[rgba(255,184,48,0.15)] p-3 hover:border-[rgba(255,184,48,0.3)] transition-colors cursor-pointer">
            <div className="text-[10px] font-bold tracking-widest text-[#FFB830] uppercase mb-1">Free Plan</div>
            <div className="text-xs text-[#7A95AE] mb-2">5 of 5 listings used</div>
            <div className="w-full h-1 bg-[#1A2D40] overflow-hidden">
              <div className="h-full bg-[#FFB830] w-full" />
            </div>
            <div className="mt-2 text-[10px] font-bold tracking-widest text-[#FFB830] uppercase">
              Upgrade to Pro →
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
