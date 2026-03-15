'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Eye, QrCode, Home, Smartphone, Monitor, Tablet } from 'lucide-react';
import api from '@/lib/api';

const DAYS_OPTIONS = [7, 14, 30, 90];

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  mobile: <Smartphone size={14} />,
  tablet: <Tablet size={14} />,
  desktop: <Monitor size={14} />,
};

const DEVICE_COLORS: Record<string, string> = {
  mobile: '#00D4C8',
  tablet: '#FFB830',
  desktop: '#A78BFA',
  unknown: '#4A6580',
};

const PIE_COLORS = ['#00D4C8', '#FFB830', '#A78BFA', '#2ECC8A', '#FF4D6A', '#60A5FA'];

function formatPrice(price: number) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

function StatCard({ label, value, sub, icon: Icon, color, trend }: any) {
  return (
    <div className="bg-[#111C28] border border-[#1A2D40] p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold ${
            trend > 0 ? 'text-[#2ECC8A]' : trend < 0 ? 'text-[#FF4D6A]' : 'text-[#4A6580]'
          }`}>
            {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-3xl font-black text-white mb-1">{value}</div>
      <div className="text-xs font-semibold text-white mb-0.5">{label}</div>
      {sub && <div className="text-[11px] text-[#4A6580]">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111C28] border border-[#1A2D40] px-3 py-2 text-xs shadow-xl">
      <div className="text-[#7A95AE] mb-1">{label}</div>
      <div className="font-bold text-[#00D4C8]">{payload[0].value} scans</div>
    </div>
  );
};

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await api.get(`/analytics?days=${days}`);
        setData(res.data.data);
      } catch {
        // handle silently
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [days]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-[#111C28]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-[#111C28]" />)}
        </div>
        <div className="h-64 bg-[#111C28]" />
      </div>
    );
  }

  const { overview, daily, byDevice, topListings, byCity, weekly } = data || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header + period selector */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Analytics</h1>
          <p className="text-[#7A95AE] text-sm mt-0.5">QR scans, listing views and performance</p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {DAYS_OPTIONS.map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs font-bold tracking-widest uppercase transition-colors ${
                days === d
                  ? 'bg-[#00D4C8] text-[#080F17]'
                  : 'bg-[#111C28] border border-[#1A2D40] text-[#7A95AE] hover:text-white'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total QR Scans"
          value={parseInt(overview?.total_scans || 0).toLocaleString()}
          sub={`${parseInt(overview?.scans_this_month || 0)} this month`}
          icon={QrCode}
          color="#00D4C8"
          trend={weekly?.change_pct}
        />
        <StatCard
          label="Total Views"
          value={parseInt(overview?.total_views || 0).toLocaleString()}
          sub="Across all listings"
          icon={Eye}
          color="#A78BFA"
        />
        <StatCard
          label="Active Listings"
          value={overview?.active_listings || 0}
          sub={`${overview?.total_listings || 0} total listings`}
          icon={Home}
          color="#FFB830"
        />
        <StatCard
          label="QR Codes"
          value={overview?.active_qr_codes || 0}
          sub={`${overview?.total_qr_codes || 0} total created`}
          icon={QrCode}
          color="#2ECC8A"
        />
      </div>

      {/* Weekly comparison banner */}
      {weekly && (
        <div className="bg-[#111C28] border border-[#1A2D40] px-5 py-4 flex items-center gap-6">
          <div>
            <div className="text-[10px] text-[#4A6580] uppercase tracking-widest mb-0.5">This Week</div>
            <div className="text-2xl font-black text-white">{weekly.this_week} scans</div>
          </div>
          <div className="h-10 w-px bg-[#1A2D40]" />
          <div>
            <div className="text-[10px] text-[#4A6580] uppercase tracking-widest mb-0.5">Last Week</div>
            <div className="text-2xl font-black text-[#7A95AE]">{weekly.last_week} scans</div>
          </div>
          <div className="h-10 w-px bg-[#1A2D40]" />
          <div className={`flex items-center gap-2 text-lg font-black ${
            weekly.change_pct > 0 ? 'text-[#2ECC8A]' : weekly.change_pct < 0 ? 'text-[#FF4D6A]' : 'text-[#4A6580]'
          }`}>
            {weekly.change_pct > 0 ? <TrendingUp size={20} /> : weekly.change_pct < 0 ? <TrendingDown size={20} /> : <Minus size={20} />}
            {weekly.change_pct > 0 ? '+' : ''}{weekly.change_pct}% vs last week
          </div>
        </div>
      )}

      {/* Daily scans chart */}
      <div className="bg-[#111C28] border border-[#1A2D40] p-6">
        <div className="text-[10px] font-bold tracking-widest text-[#00D4C8] uppercase mb-1">Scan Activity</div>
        <h2 className="text-sm font-bold text-white mb-6">Daily QR Scans — Last {days} Days</h2>
        {daily?.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={daily} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2D40" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#4A6580', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={days > 14 ? Math.floor(daily.length / 7) : 0}
              />
              <YAxis
                tick={{ fill: '#4A6580', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,212,200,0.05)' }} />
              <Bar dataKey="scans" fill="#00D4C8" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </div>

      {/* Two column: device breakdown + top listings */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Device breakdown */}
        <div className="bg-[#111C28] border border-[#1A2D40] p-6">
          <div className="text-[10px] font-bold tracking-widest text-[#FFB830] uppercase mb-1">Device Breakdown</div>
          <h2 className="text-sm font-bold text-white mb-5">Scans by Device Type</h2>
          {byDevice?.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={byDevice}
                    dataKey="count"
                    nameKey="device"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    strokeWidth={0}
                  >
                    {byDevice.map((entry: any, index: number) => (
                      <Cell key={entry.device} fill={DEVICE_COLORS[entry.device] || PIE_COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {byDevice.map((item: any) => (
                  <div key={item.device} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 flex-shrink-0" style={{ background: DEVICE_COLORS[item.device] || '#4A6580' }} />
                      <span className="text-xs text-[#7A95AE] capitalize flex items-center gap-1.5">
                        {DEVICE_ICONS[item.device]}
                        {item.device}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{item.count}</span>
                      <span className="text-[10px] text-[#4A6580]">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyChart />
          )}
        </div>

        {/* Top listings */}
        <div className="bg-[#111C28] border border-[#1A2D40] p-6">
          <div className="text-[10px] font-bold tracking-widest text-[#A78BFA] uppercase mb-1">Performance</div>
          <h2 className="text-sm font-bold text-white mb-5">Top Listings by QR Scans</h2>
          {topListings?.length > 0 ? (
            <div className="space-y-3">
              {topListings.map((listing: any, index: number) => (
                <div key={listing.id} className="flex items-center gap-3">
                  <div className="text-xs font-black text-[#4A6580] w-4 flex-shrink-0">#{index + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{listing.title}</div>
                    <div className="text-[10px] text-[#4A6580]">
                      {listing.city} · {listing.listing_type} · {formatPrice(listing.price)}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-sm font-black text-[#00D4C8]">{listing.scan_count}</div>
                    <div className="text-[9px] text-[#4A6580]">scans</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyChart message="No scan data yet" />
          )}
        </div>
      </div>

      {/* Scans by city */}
      {byCity?.length > 0 && (
        <div className="bg-[#111C28] border border-[#1A2D40] p-6">
          <div className="text-[10px] font-bold tracking-widest text-[#2ECC8A] uppercase mb-1">Geographic</div>
          <h2 className="text-sm font-bold text-white mb-5">Scans by City</h2>
          <div className="space-y-2">
            {byCity.map((item: any) => {
              const maxCount = Math.max(...byCity.map((c: any) => parseInt(c.count)));
              const pct = Math.round((parseInt(item.count) / maxCount) * 100);
              return (
                <div key={item.city} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-[#7A95AE] flex-shrink-0 truncate">{item.city}</div>
                  <div className="flex-1 h-5 bg-[#0D1821] overflow-hidden">
                    <div
                      className="h-full bg-[#2ECC8A] transition-all duration-500"
                      style={{ width: `${pct}%`, opacity: 0.7 + (pct / 100) * 0.3 }}
                    />
                  </div>
                  <div className="text-xs font-bold text-white w-8 text-right flex-shrink-0">{item.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyChart({ message = 'No data for this period' }) {
  return (
    <div className="h-32 flex items-center justify-center">
      <p className="text-sm text-[#4A6580]">{message}</p>
    </div>
  );
}
