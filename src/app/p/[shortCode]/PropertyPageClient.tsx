'use client';

import { useState } from 'react';
import {
  MapPin, BedDouble, Bath, Maximize2, Building2,
  Phone, MessageCircle, Share2, ChevronLeft, ChevronRight,
  CheckCircle2, AlertTriangle, Home, Layers, Compass,
} from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  description?: string;
  property_type: string;
  listing_type: string;
  price: number;
  price_negotiable: boolean;
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  floor_number?: number;
  total_floors?: number;
  furnishing?: string;
  facing?: string;
  address: string;
  locality?: string;
  city: string;
  state: string;
  pincode?: string;
  images: { url: string; is_primary: boolean }[];
  amenities: string[];
  status: string;
  view_count: number;
  agent_name: string;
  agent_phone?: string;
  agent_rera?: string;
  agent_photo?: string;
  qr_scans?: number;
}

function formatPrice(price: number, type: string) {
  const suffix = type === 'rent' ? '/month' : '';
  if (price >= 10000000) return { main: `₹${(price / 10000000).toFixed(2)}`, unit: `Crore${suffix}` };
  if (price >= 100000) return { main: `₹${(price / 100000).toFixed(2)}`, unit: `Lakh${suffix}` };
  return { main: `₹${price.toLocaleString('en-IN')}`, unit: suffix };
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment', villa: 'Villa', house: 'House',
  plot: 'Plot / Land', commercial: 'Commercial', pg: 'PG / Hostel',
};

const FURNISHING_LABELS: Record<string, string> = {
  'unfurnished': 'Unfurnished',
  'semi-furnished': 'Semi-Furnished',
  'fully-furnished': 'Fully Furnished',
};

export function PropertyPageClient({
  listing,
  isUnavailable,
}: {
  listing: Listing;
  isUnavailable: boolean;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [copied, setCopied] = useState(false);

  const images = listing.images || [];
  const { main: priceMain, unit: priceUnit } = formatPrice(listing.price, listing.listing_type);
  const isSold = listing.status === 'sold';
  const isRented = listing.status === 'rented';
  const isGone = isSold || isRented || isUnavailable;

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: listing.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleWhatsApp() {
    const msg = encodeURIComponent(
      `Hi, I'm interested in your property:\n*${listing.title}*\n${listing.city}, ${listing.state}\nPrice: ₹${listing.price.toLocaleString('en-IN')}\n\n${window.location.href}`
    );
    const phone = listing.agent_phone?.replace(/\D/g, '');
    window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank');
  }

  return (
    <div className="min-h-screen bg-[#F5F2EE] font-sans" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Unavailable Banner ─────────────────────────────────────── */}
      {isGone && (
        <div className="bg-[#1A0A00] text-[#FFB830] text-center py-3 px-4 text-sm font-bold tracking-wide flex items-center justify-center gap-2">
          <AlertTriangle size={16} />
          This property has been {isSold ? 'SOLD' : isRented ? 'RENTED' : 'removed'}.
          Similar properties may be available — contact the agent.
        </div>
      )}

      {/* ── Image Gallery ──────────────────────────────────────────── */}
      <div className="relative bg-[#1C1C1C] overflow-hidden" style={{ height: 'min(60vw, 420px)' }}>
        {images.length > 0 ? (
          <>
            <img
              src={images[activeImage]?.url}
              alt={listing.title}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Image nav */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setActiveImage(i => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
                {/* Dot indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImage ? 'bg-white w-4' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Image counter */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 font-mono">
              {activeImage + 1}/{images.length}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-[#444]">
            <Home size={48} strokeWidth={1} />
            <span className="text-sm">No photos available</span>
          </div>
        )}

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 flex gap-1 px-3 pb-2 overflow-x-auto scrollbar-none">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`flex-shrink-0 w-12 h-12 overflow-hidden border-2 transition-all ${
                  i === activeImage ? 'border-white' : 'border-transparent opacity-60 hover:opacity-80'
                }`}
              >
                <img src={img.url} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Main Content ───────────────────────────────────────────── */}
      <div className="max-w-xl mx-auto px-4 pb-32">

        {/* Price + Status */}
        <div className="bg-white border-b-4 border-[#1C1C1C] px-5 py-5 -mx-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#1C1C1C] leading-none">{priceMain}</span>
                <span className="text-sm font-semibold text-[#666]">{priceUnit}</span>
              </div>
              {listing.price_negotiable && (
                <span className="text-xs text-[#2D9945] font-semibold mt-0.5 block">Negotiable</span>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className={`text-[10px] font-black tracking-widest px-2.5 py-1 uppercase ${
                listing.status === 'active'
                  ? 'bg-[#E8F5E9] text-[#2D9945]'
                  : listing.status === 'sold'
                  ? 'bg-[#FFF3E0] text-[#E65100]'
                  : 'bg-[#FFF8E1] text-[#F57F17]'
              }`}>
                {listing.status === 'active' ? 'Available' : listing.status}
              </span>
              <span className="text-[10px] text-[#999] uppercase tracking-wide">
                {PROPERTY_TYPE_LABELS[listing.property_type]} · For {listing.listing_type}
              </span>
            </div>
          </div>
        </div>

        {/* Title + location */}
        <div className="bg-white px-5 py-5 -mx-4 mt-0 border-b border-[#EEE]">
          <h1 className="text-xl font-black text-[#1C1C1C] leading-snug mb-2">{listing.title}</h1>
          <div className="flex items-center gap-1.5 text-sm text-[#666]">
            <MapPin size={14} className="text-[#C0392B] flex-shrink-0" />
            <span>
              {listing.locality ? `${listing.locality}, ` : ''}{listing.city}, {listing.state}
              {listing.pincode ? ` — ${listing.pincode}` : ''}
            </span>
          </div>
        </div>

        {/* Quick specs */}
        <div className="grid grid-cols-4 gap-0 bg-[#1C1C1C] -mx-4 mt-3">
          {[
            { icon: BedDouble, label: 'Beds', value: listing.bedrooms != null ? `${listing.bedrooms}` : '—' },
            { icon: Bath, label: 'Baths', value: listing.bathrooms != null ? `${listing.bathrooms}` : '—' },
            { icon: Maximize2, label: 'Area', value: listing.area_sqft ? `${listing.area_sqft}` : '—' },
            { icon: Layers, label: 'Floor', value: listing.floor_number != null ? `${listing.floor_number}/${listing.total_floors || '?'}` : '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center py-4 border-r border-[#333] last:border-0">
              <Icon size={16} className="text-[#00D4C8] mb-1" />
              <div className="text-sm font-bold text-white">{value}</div>
              <div className="text-[10px] text-[#666] uppercase tracking-wide mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Property details */}
        <Section title="Property Details">
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            {[
              { label: 'Type', value: PROPERTY_TYPE_LABELS[listing.property_type] },
              { label: 'Purpose', value: listing.listing_type === 'sale' ? 'For Sale' : 'For Rent' },
              listing.furnishing && { label: 'Furnishing', value: FURNISHING_LABELS[listing.furnishing] || listing.furnishing },
              listing.facing && { label: 'Facing', value: listing.facing },
              listing.area_sqft && { label: 'Area', value: `${listing.area_sqft} sq.ft` },
              listing.floor_number != null && { label: 'Floor', value: `${listing.floor_number} of ${listing.total_floors || '?'}` },
            ].filter(Boolean).map((item: any) => (
              <div key={item.label}>
                <div className="text-[10px] text-[#999] uppercase tracking-wide mb-0.5">{item.label}</div>
                <div className="text-sm font-semibold text-[#1C1C1C]">{item.value}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Description */}
        {listing.description && (
          <Section title="About this Property">
            <p className="text-sm text-[#444] leading-relaxed whitespace-pre-line">{listing.description}</p>
          </Section>
        )}

        {/* Amenities */}
        {listing.amenities?.length > 0 && (
          <Section title="Amenities">
            <div className="flex flex-wrap gap-2">
              {listing.amenities.map(a => (
                <span key={a} className="flex items-center gap-1.5 text-xs bg-[#F0FAF0] text-[#2D7A3A] px-3 py-1.5 font-medium border border-[#C8E6C9]">
                  <CheckCircle2 size={11} />
                  {a}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Location */}
        <Section title="Location">
          <div className="flex items-start gap-2 text-sm text-[#444]">
            <MapPin size={16} className="text-[#C0392B] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#1C1C1C]">{listing.address}</div>
              <div className="text-[#666] mt-0.5">
                {listing.locality ? `${listing.locality}, ` : ''}{listing.city}, {listing.state}
                {listing.pincode ? ` ${listing.pincode}` : ''}
              </div>
            </div>
          </div>
        </Section>

        {/* Agent card */}
        <Section title="Listed By">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#1C1C1C] flex items-center justify-center text-xl font-black text-white flex-shrink-0">
              {listing.agent_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="font-bold text-[#1C1C1C] text-base">{listing.agent_name}</div>
              {listing.agent_phone && (
                <div className="text-sm text-[#666] mt-0.5">+91 {listing.agent_phone}</div>
              )}
              {listing.agent_rera && (
                <div className="text-[10px] text-[#00897B] font-bold tracking-wide mt-1 uppercase">
                  RERA: {listing.agent_rera}
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 text-xs text-[#999]">
          <span>{listing.view_count} views</span>
          {listing.qr_scans && <span>·</span>}
          {listing.qr_scans && <span>{listing.qr_scans} QR scans</span>}
          <span>·</span>
          <button onClick={handleShare} className="flex items-center gap-1 hover:text-[#1C1C1C] transition-colors">
            <Share2 size={12} />
            {copied ? 'Link copied!' : 'Share'}
          </button>
        </div>

        {/* Enquiry form */}
        {!isGone && (
          <EnquiryForm shortCode={listing.short_code} listingTitle={listing.title} />
        )}

        {/* Powered by */}
        <div className="mt-8 text-center">
          <span className="text-[10px] text-[#CCC] uppercase tracking-widest">Powered by</span>
          <div className="text-xs font-bold text-[#999] mt-0.5">QR Estate · India&apos;s QR-Native Listing Platform</div>
        </div>
      </div>

      {/* ── Sticky CTA ─────────────────────────────────────────────── */}
      {!isGone && listing.agent_phone && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#1C1C1C] px-4 py-3 flex gap-3 max-w-xl mx-auto shadow-2xl">
          <a
            href={`tel:+91${listing.agent_phone.replace(/\D/g, '')}`}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1C1C1C] text-white py-3.5 font-bold text-sm hover:bg-[#333] transition-colors active:scale-95"
          >
            <Phone size={16} fill="white" />
            Call Agent
          </a>
          <button
            onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 font-bold text-sm hover:bg-[#20BD5C] transition-colors active:scale-95"
          >
            <MessageCircle size={16} fill="white" />
            WhatsApp
          </button>
        </div>
      )}

      {/* No phone fallback */}
      {!isGone && !listing.agent_phone && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#1C1C1C] px-4 py-3 max-w-xl mx-auto shadow-2xl">
          <div className="text-center text-sm text-[#666]">Contact information not available</div>
        </div>
      )}
    </div>
  );
}

function EnquiryForm({ shortCode, listingTitle }: { shortCode: string; listingTitle: string }) {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.phone) return;
    setStatus('loading');
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/enquiry/${shortCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'website' }),
      });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="bg-white -mx-4 mt-3 px-5 py-8 text-center border-b border-[#EEE]">
        <div className="text-3xl mb-2">✅</div>
        <div className="font-bold text-[#1C1C1C] mb-1">Enquiry Sent!</div>
        <div className="text-sm text-[#666]">The agent will contact you shortly.</div>
      </div>
    );
  }

  return (
    <div className="bg-white -mx-4 mt-3 px-5 py-5 border-b border-[#EEE]">
      <h2 className="text-[10px] font-black tracking-[2px] text-[#999] uppercase mb-4">Send Enquiry</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm text-[#1C1C1C] outline-none focus:border-[#1C1C1C] transition-colors"
          placeholder="Your name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
        <input
          className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm text-[#1C1C1C] outline-none focus:border-[#1C1C1C] transition-colors"
          placeholder="Mobile number *"
          type="tel"
          required
          value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        />
        <textarea
          className="w-full border border-[#E0E0E0] px-3 py-2.5 text-sm text-[#1C1C1C] outline-none focus:border-[#1C1C1C] transition-colors resize-none"
          placeholder="Your message (optional)"
          rows={3}
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
        />
        {status === 'error' && <p className="text-xs text-red-500">Something went wrong. Please try again.</p>}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-[#1C1C1C] text-white py-3 font-bold text-sm hover:bg-[#333] transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? 'Sending...' : 'Send Enquiry'}
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white -mx-4 mt-3 px-5 py-5 border-b border-[#EEE]">
      <h2 className="text-[10px] font-black tracking-[2px] text-[#999] uppercase mb-4">{title}</h2>
      {children}
    </div>
  );
}
