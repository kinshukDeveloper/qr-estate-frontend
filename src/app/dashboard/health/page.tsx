'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock, QrCode, Home, TrendingDown, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#2ECC8A' : score >= 50 ? '#FFB830' : '#FF4D6A';
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="#1A2D40" strokeWidth="8" />
        <circle
          cx="72" cy="72" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-3xl font-black" style={{ color }}>{score}</div>
        <div className="text-[10px] text-[#4A6580] uppercase tracking-wide">Health Score</div>
      </div>
    </div>
  );
}

function IssueSection({ title, icon: Icon, color, items, emptyMsg, renderItem }: any) {
  return (
    <div className="bg-[#111C28] border border-[#1A2D40] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} style={{ color }} />
        <h2 className="text-sm font-bold text-white">{title}</h2>
        <span className="ml-auto text-xs font-bold px-2 py-0.5" style={{ color, background: `${color}15` }}>
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-[#2ECC8A]">
          <CheckCircle size={14} /> {emptyMsg}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(renderItem)}
        </div>
      )}
    </div>
  );
}

export default function HealthPage() {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    try {
      const res = await api.get('/health/qr');
      setReport(res.data.data);
    } catch { /* silent */ }
    finally { setIsLoading(false); setRefreshing(false); }
  }

  useEffect(() => { load(); }, []);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-[#111C28]" />
        <div className="h-48 bg-[#111C28]" />
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-40 bg-[#111C28]" />)}
        </div>
      </div>
    );
  }

  const { health_score, issues, summary } = report || {};
  const statusColor = summary?.status === 'healthy' ? '#2ECC8A' : summary?.status === 'warning' ? '#FFB830' : '#FF4D6A';

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">QR Health Monitor</h1>
          <p className="text-[#7A95AE] text-sm mt-0.5">Detect and fix issues with your QR codes and listings</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} isLoading={refreshing} className="flex items-center gap-2">
          <RefreshCw size={13} /> Refresh
        </Button>
      </div>

      {/* Score card */}
      <div className="bg-[#111C28] border border-[#1A2D40] p-6 flex items-center gap-8">
        <ScoreRing score={health_score || 0} />
        <div className="flex-1">
          <div className={`inline-flex items-center gap-2 text-xs font-black tracking-widest uppercase px-3 py-1.5 mb-3`}
            style={{ color: statusColor, background: `${statusColor}12`, border: `1px solid ${statusColor}30` }}>
            {summary?.status === 'healthy' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
            {summary?.status || 'unknown'}
          </div>
          <p className="text-sm text-[#7A95AE] leading-relaxed">{summary?.message}</p>

          {/* Issue counts */}
          <div className="flex gap-4 mt-4">
            {[
              { label: 'Dead QRs', count: issues?.dead_qr_codes?.length || 0, color: '#FF4D6A' },
              { label: 'No QR', count: issues?.listings_without_qr?.length || 0, color: '#FFB830' },
              { label: 'Stale', count: issues?.stale_listings?.length || 0, color: '#A78BFA' },
              { label: 'Scan Drop', count: issues?.scan_drops?.length || 0, color: '#60A5FA' },
            ].map(({ label, count, color }) => (
              <div key={label} className="text-center">
                <div className="text-lg font-black" style={{ color: count > 0 ? color : '#4A6580' }}>{count}</div>
                <div className="text-[10px] text-[#4A6580] uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Issue sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <IssueSection
          title="Dead / Inactive QR Codes"
          icon={QrCode}
          color="#FF4D6A"
          items={issues?.dead_qr_codes || []}
          emptyMsg="All QR codes are active"
          renderItem={(qr: any) => (
            <div key={qr.id} className="flex items-start justify-between gap-2 py-2 border-b border-[#1A2D40] last:border-0">
              <div>
                <div className="text-xs font-medium text-white truncate max-w-[160px]">{qr.listing_title}</div>
                <div className="text-[10px] text-[#4A6580]">{qr.city} · {qr.scan_count} scans · {qr.listing_status}</div>
              </div>
              <Link href="/dashboard/qr" className="text-[10px] text-[#00D4C8] hover:underline whitespace-nowrap">Fix →</Link>
            </div>
          )}
        />

        <IssueSection
          title="Listings Without QR Code"
          icon={Home}
          color="#FFB830"
          items={issues?.listings_without_qr || []}
          emptyMsg="All active listings have QR codes"
          renderItem={(l: any) => (
            <div key={l.id} className="flex items-start justify-between gap-2 py-2 border-b border-[#1A2D40] last:border-0">
              <div>
                <div className="text-xs font-medium text-white truncate max-w-[160px]">{l.title}</div>
                <div className="text-[10px] text-[#4A6580]">{l.city}</div>
              </div>
              <Link href={`/dashboard/qr?listing=${l.id}`} className="text-[10px] text-[#FFB830] hover:underline whitespace-nowrap">Generate →</Link>
            </div>
          )}
        />

        <IssueSection
          title="Stale Listings (60+ days)"
          icon={Clock}
          color="#A78BFA"
          items={issues?.stale_listings || []}
          emptyMsg="All listings updated recently"
          renderItem={(l: any) => (
            <div key={l.id} className="flex items-start justify-between gap-2 py-2 border-b border-[#1A2D40] last:border-0">
              <div>
                <div className="text-xs font-medium text-white truncate max-w-[160px]">{l.title}</div>
                <div className="text-[10px] text-[#4A6580]">{l.days_since_update} days ago · {l.city}</div>
              </div>
              <Link href={`/dashboard/listings/${l.id}`} className="text-[10px] text-[#A78BFA] hover:underline whitespace-nowrap">Update →</Link>
            </div>
          )}
        />

        <IssueSection
          title="Scan Drops (last 14 days)"
          icon={TrendingDown}
          color="#60A5FA"
          items={issues?.scan_drops || []}
          emptyMsg="No significant scan drops"
          renderItem={(q: any) => (
            <div key={q.id} className="flex items-start justify-between gap-2 py-2 border-b border-[#1A2D40] last:border-0">
              <div>
                <div className="text-xs font-medium text-white truncate max-w-[160px]">{q.listing_title}</div>
                <div className="text-[10px] text-[#4A6580]">{q.prev_scans} scans → 0 scans</div>
              </div>
              <Link href="/dashboard/analytics" className="text-[10px] text-[#60A5FA] hover:underline whitespace-nowrap">View →</Link>
            </div>
          )}
        />
      </div>
    </div>
  );
}
