import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080F17] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#1A2D40]">
        <Link href="/" className="flex items-center gap-3 group">
          {/* QR icon */}
          <div className="w-8 h-8 border-2 border-[#00D4C8] flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-2 h-2 bg-[#00D4C8]" />
              <div className="w-2 h-2 border border-[#00D4C8]" />
              <div className="w-2 h-2 border border-[#00D4C8]" />
              <div className="w-2 h-2 bg-[#00D4C8]" />
            </div>
          </div>
          <span className="font-bold text-white text-base tracking-wide group-hover:text-[#00D4C8] transition-colors">
            QR Estate
          </span>
        </Link>
        <span className="text-xs text-[#4A6580] tracking-widest uppercase">
          India&apos;s QR-Native Listing Platform
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t border-[#1A2D40] flex items-center justify-between">
        <span className="text-xs text-[#4A6580]">© 2026 QR Estate</span>
        <div className="flex gap-6">
          <Link href="/privacy" className="text-xs text-[#4A6580] hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="text-xs text-[#4A6580] hover:text-white transition-colors">Terms</Link>
          <Link href="/support" className="text-xs text-[#4A6580] hover:text-white transition-colors">Support</Link>
        </div>
      </div>
    </div>
  );
}
