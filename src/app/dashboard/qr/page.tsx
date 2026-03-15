'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { QrCode, Download, RefreshCw, Eye, EyeOff, Zap, ChevronDown, Check } from 'lucide-react';
import { qrAPI, type QRCode } from '@/lib/qr';
import { listingsAPI, type Listing } from '@/lib/listings';
import { Button } from '@/components/ui/Button';
import axios from 'axios';

const COLORS = [
  { label: 'Black', fg: '#000000', bg: '#FFFFFF' },
  { label: 'Teal', fg: '#007A74', bg: '#FFFFFF' },
  { label: 'Navy', fg: '#0D1F2D', bg: '#FFFFFF' },
  { label: 'Gold', fg: '#B8860B', bg: '#FFFFFF' },
  { label: 'White', fg: '#FFFFFF', bg: '#000000' },
];

function formatPrice(price: number, type: string) {
  const suffix = type === 'rent' ? '/mo' : '';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr${suffix}`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L${suffix}`;
  return `₹${price.toLocaleString('en-IN')}${suffix}`;
}

export default function QRPage() {
  const searchParams = useSearchParams();
  const preselectedListing = searchParams.get('listing');

  const [listings, setListings] = useState<Listing[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [selectedListingId, setSelectedListingId] = useState(preselectedListing || '');
  const [generatedQR, setGeneratedQR] = useState<QRCode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // QR options
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [includeFrame, setIncludeFrame] = useState(false);
  const [frameLabel, setFrameLabel] = useState('Scan to View Property');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [listRes, qrRes] = await Promise.all([
          listingsAPI.getAll({ status: 'active', limit: 50 }),
          qrAPI.getAll(),
        ]);
        setListings(listRes.data.data.listings);
        setQrCodes(qrRes.data.data.qr_codes);

        // If listing pre-selected from URL, find existing QR
        if (preselectedListing) {
          const existing = qrRes.data.data.qr_codes.find(
            (q: QRCode) => q.listing_id === preselectedListing
          );
          if (existing) setGeneratedQR(existing);
        }
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  async function handleGenerate() {
    if (!selectedListingId) {
      setError('Please select a listing first');
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const res = await qrAPI.generate({
        listing_id: selectedListingId,
        foreground_color: selectedColor.fg,
        background_color: selectedColor.bg,
        include_frame: includeFrame,
        frame_label: frameLabel,
      });
      const newQR = res.data.data.qr;
      setGeneratedQR(newQR);

      // Update list
      setQrCodes(prev => {
        const exists = prev.find(q => q.listing_id === selectedListingId);
        if (exists) return prev.map(q => q.listing_id === selectedListingId ? { ...q, ...newQR } : q);
        return [newQR, ...prev];
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to generate QR');
      }
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleToggle(qrId: string) {
    try {
      const res = await qrAPI.toggle(qrId);
      setQrCodes(prev => prev.map(q => q.id === qrId ? { ...q, is_active: res.data.data.is_active } : q));
      if (generatedQR?.id === qrId) {
        setGeneratedQR(prev => prev ? { ...prev, is_active: res.data.data.is_active } : prev);
      }
    } catch {
      setError('Failed to toggle QR status');
    }
  }

  function handleDownload(qrId: string, format: 'png' | 'svg' = 'png') {
    const url = qrAPI.getDownloadUrl(qrId, format);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${qrId}.${format}`;
    // Add auth header via fetch instead for authenticated download
    fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('qr_estate_access_token') || ''}` } })
      .then(r => r.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => setError('Download failed'));
  }

  const selectedListing = listings.find(l => l.id === selectedListingId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">QR Codes</h1>
        <p className="text-[#7A95AE] text-sm mt-0.5">Generate and manage QR codes for your listings</p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-[rgba(255,77,106,0.08)] border border-[rgba(255,77,106,0.2)] text-[#FF4D6A] text-sm">
          ⚠ {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── LEFT: Generator ─────────────────────────────────── */}
        <div className="space-y-4">
          <div className="bg-[#111C28] border border-[#1A2D40] p-6 space-y-5">
            <div>
              <div className="text-[10px] font-bold tracking-widest text-[#00D4C8] uppercase mb-1">Step 1</div>
              <h2 className="text-sm font-bold text-white mb-3">Select a Listing</h2>

              {isLoading ? (
                <div className="input animate-pulse bg-[#1A2D40] h-11" />
              ) : listings.length === 0 ? (
                <div className="text-sm text-[#4A6580] p-3 border border-dashed border-[#1A2D40] text-center">
                  No active listings yet.{' '}
                  <a href="/dashboard/listings/new" className="text-[#00D4C8] hover:underline">Create one first →</a>
                </div>
              ) : (
                <select
                  className="input"
                  value={selectedListingId}
                  onChange={e => {
                    setSelectedListingId(e.target.value);
                    setGeneratedQR(null);
                    // Check if QR already exists
                    const existing = qrCodes.find(q => q.listing_id === e.target.value);
                    if (existing) setGeneratedQR(existing);
                  }}
                >
                  <option value="">-- Choose a listing --</option>
                  {listings.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.title} · {l.city} · {formatPrice(l.price, l.listing_type)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Color */}
            <div>
              <div className="text-[10px] font-bold tracking-widest text-[#00D4C8] uppercase mb-1">Step 2</div>
              <h2 className="text-sm font-bold text-white mb-3">Choose Color</h2>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c.label}
                    onClick={() => setSelectedColor(c)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs border transition-colors ${
                      selectedColor.label === c.label
                        ? 'border-[#00D4C8] text-[#00D4C8]'
                        : 'border-[#1A2D40] text-[#7A95AE] hover:border-[#4A6580]'
                    }`}
                  >
                    <div
                      className="w-4 h-4 border border-[#1A2D40] flex-shrink-0"
                      style={{ background: c.fg }}
                    />
                    {c.label}
                    {selectedColor.label === c.label && <Check size={10} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame */}
            <div>
              <div className="text-[10px] font-bold tracking-widest text-[#00D4C8] uppercase mb-1">Step 3</div>
              <h2 className="text-sm font-bold text-white mb-3">Branding Frame</h2>
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <div
                  onClick={() => setIncludeFrame(!includeFrame)}
                  className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                    includeFrame ? 'bg-[#00D4C8]' : 'bg-[#1A2D40]'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    includeFrame ? 'left-5' : 'left-0.5'
                  }`} />
                </div>
                <span className="text-sm text-[#7A95AE]">Add branded frame with label</span>
              </label>
              {includeFrame && (
                <input
                  type="text"
                  value={frameLabel}
                  onChange={e => setFrameLabel(e.target.value)}
                  className="input text-sm"
                  placeholder="Label text on frame..."
                  maxLength={60}
                />
              )}
            </div>

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              isLoading={isGenerating}
              fullWidth
              size="lg"
              className="flex items-center gap-2"
            >
              <Zap size={16} />
              {generatedQR ? 'Regenerate QR Code' : 'Generate QR Code'}
            </Button>
          </div>
        </div>

        {/* ── RIGHT: Preview ──────────────────────────────────── */}
        <div className="bg-[#111C28] border border-[#1A2D40] p-6 flex flex-col items-center justify-center min-h-80">
          {!generatedQR ? (
            <div className="text-center">
              <div className="w-32 h-32 border-2 border-dashed border-[#1A2D40] flex items-center justify-center mb-4 mx-auto">
                <QrCode size={40} className="text-[#1A2D40]" />
              </div>
              <p className="text-[#4A6580] text-sm">
                {selectedListingId ? 'Click Generate to create QR' : 'Select a listing to get started'}
              </p>
            </div>
          ) : (
            <div className="w-full">
              {/* QR image */}
              <div className="flex justify-center mb-4">
                {generatedQR.qr_url?.startsWith('data:') ? (
                  <img src={generatedQR.qr_url} alt="QR Code" className="w-52 h-52" />
                ) : generatedQR.qr_url ? (
                  <img src={generatedQR.qr_url} alt="QR Code" className="w-52 h-52" />
                ) : (
                  <div className="w-52 h-52 bg-[#0D1821] border border-[#1A2D40] flex items-center justify-center">
                    <span className="text-xs text-[#4A6580]">Configure Cloudinary to see preview</span>
                  </div>
                )}
              </div>

              {/* Listing name */}
              <div className="text-center mb-4">
                <div className="text-xs font-bold text-white mb-0.5 truncate">{generatedQR.listing_title}</div>
                <div className="text-[10px] text-[#4A6580] font-mono">{generatedQR.target_url}</div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#0D1821] p-3 text-center">
                  <div className="text-xl font-black text-[#00D4C8]">{generatedQR.scan_count}</div>
                  <div className="text-[10px] text-[#4A6580] uppercase tracking-wide">Total Scans</div>
                </div>
                <div className="bg-[#0D1821] p-3 text-center">
                  <div className={`text-sm font-bold ${generatedQR.is_active ? 'text-[#2ECC8A]' : 'text-[#FF4D6A]'}`}>
                    {generatedQR.is_active ? '● Active' : '○ Inactive'}
                  </div>
                  <div className="text-[10px] text-[#4A6580] uppercase tracking-wide mt-0.5">Status</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload(generatedQR.id, 'png')}
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center gap-1.5"
                >
                  <Download size={13} /> PNG
                </Button>
                <Button
                  onClick={() => handleDownload(generatedQR.id, 'svg')}
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center gap-1.5"
                >
                  <Download size={13} /> SVG
                </Button>
                <Button
                  onClick={() => handleToggle(generatedQR.id)}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  {generatedQR.is_active ? <EyeOff size={13} /> : <Eye size={13} />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── All QR Codes ────────────────────────────────────────── */}
      {qrCodes.length > 0 && (
        <div>
          <div className="text-[10px] font-bold tracking-widest text-[#4A6580] uppercase mb-3">
            All QR Codes — {qrCodes.length} total
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {qrCodes.map(qr => (
              <div
                key={qr.id}
                className={`bg-[#111C28] border p-4 cursor-pointer transition-colors ${
                  generatedQR?.id === qr.id
                    ? 'border-[#00D4C8]'
                    : 'border-[#1A2D40] hover:border-[#4A6580]'
                }`}
                onClick={() => {
                  setGeneratedQR(qr);
                  setSelectedListingId(qr.listing_id);
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Mini QR preview */}
                  <div className="w-12 h-12 bg-[#0D1821] flex-shrink-0 flex items-center justify-center">
                    {qr.qr_url && !qr.qr_url.startsWith('data:') ? (
                      <img src={qr.qr_url} alt="" className="w-10 h-10" />
                    ) : (
                      <QrCode size={20} className="text-[#4A6580]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{qr.listing_title}</div>
                    <div className="text-[10px] text-[#4A6580] mt-0.5">{qr.city} · {qr.listing_type}</div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-[#00D4C8] font-mono">{qr.scan_count} scans</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 ${
                        qr.is_active
                          ? 'bg-[rgba(46,204,138,0.1)] text-[#2ECC8A]'
                          : 'bg-[rgba(255,77,106,0.1)] text-[#FF4D6A]'
                      }`}>
                        {qr.is_active ? 'ACTIVE' : 'OFF'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
