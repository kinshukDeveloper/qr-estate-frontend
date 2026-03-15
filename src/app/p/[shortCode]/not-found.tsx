import Link from 'next/link';

export default function PropertyNotFound() {
  return (
    <div className="min-h-screen bg-[#F5F2EE] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-4">🏠</div>
      <h1 className="text-2xl font-black text-[#1C1C1C] mb-2">Property Not Found</h1>
      <p className="text-[#666] text-sm mb-8 max-w-xs">
        This QR code may be expired, the listing may have been removed, or the link is incorrect.
      </p>
      <p className="text-[10px] text-[#999] uppercase tracking-widest">Powered by QR Estate</p>
    </div>
  );
}
