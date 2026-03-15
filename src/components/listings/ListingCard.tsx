'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Eye, Pencil, Trash2, MoreVertical, QrCode, BedDouble, Bath, Maximize2, FileDown } from 'lucide-react';
import { type Listing } from '@/lib/listings';

const STATUS_STYLES: Record<string, string> = {
  active:   'bg-[rgba(46,204,138,0.12)] text-[#2ECC8A] border-[rgba(46,204,138,0.2)]',
  draft:    'bg-[rgba(122,149,174,0.12)] text-[#7A95AE] border-[rgba(122,149,174,0.2)]',
  sold:     'bg-[rgba(96,165,250,0.12)] text-[#60A5FA] border-[rgba(96,165,250,0.2)]',
  rented:   'bg-[rgba(167,139,250,0.12)] text-[#A78BFA] border-[rgba(167,139,250,0.2)]',
  inactive: 'bg-[rgba(255,77,106,0.12)] text-[#FF4D6A] border-[rgba(255,77,106,0.2)]',
};

function formatPrice(price: number, listing_type: string) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

interface Props {
  listing: Listing;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

export function ListingCard({ listing, onDelete, onStatusChange }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const primaryImage = listing.images?.find(i => i.is_primary) || listing.images?.[0];

  async function handleDelete() {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    setDeleting(true);
    await onDelete(listing.id);
  }

  return (
    <div className={`bg-[#111C28] border border-[#1A2D40] overflow-hidden transition-all hover:-translate-y-0.5 hover:border-[#1A2D40] hover:shadow-lg ${deleting ? 'opacity-50' : ''}`}>
      {/* Image */}
      <div className="relative h-44 bg-[#0D1821] overflow-hidden">
        {primaryImage ? (
          <img src={primaryImage.url} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#1A2D40]">
            <Home size={32} />
            <span className="text-xs text-[#4A6580]">No photo</span>
          </div>
        )}

        {/* Status badge */}
        <div className={`absolute top-3 left-3 text-[10px] font-bold tracking-widest uppercase px-2 py-1 border ${STATUS_STYLES[listing.status]}`}>
          {listing.status}
        </div>

        {/* Image count */}
        {listing.images?.length > 0 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] px-2 py-0.5 font-mono">
            {listing.images.length} photos
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Type + price */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-[#4A6580] uppercase mb-0.5">
              {listing.property_type} · {listing.listing_type}
            </div>
            <h3 className="text-sm font-bold text-white leading-tight line-clamp-1">{listing.title}</h3>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-base font-black text-[#00D4C8]">{formatPrice(listing.price, listing.listing_type)}</div>
            {listing.listing_type === 'rent' && <div className="text-[10px] text-[#4A6580]">/month</div>}
          </div>
        </div>

        {/* Location */}
        <div className="text-xs text-[#4A6580] mb-3 truncate">
          📍 {listing.locality ? `${listing.locality}, ` : ''}{listing.city}
        </div>

        {/* Specs */}
        <div className="flex gap-3 text-xs text-[#7A95AE] mb-4">
          {listing.bedrooms != null && (
            <span className="flex items-center gap-1"><BedDouble size={12} />{listing.bedrooms} Bed</span>
          )}
          {listing.bathrooms != null && (
            <span className="flex items-center gap-1"><Bath size={12} />{listing.bathrooms} Bath</span>
          )}
          {listing.area_sqft && (
            <span className="flex items-center gap-1"><Maximize2 size={12} />{listing.area_sqft} sqft</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 items-center">
          <Link
            href={`/dashboard/listings/${listing.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold border border-[#1A2D40] text-[#7A95AE] hover:border-[#00D4C8] hover:text-[#00D4C8] transition-colors"
          >
            <Pencil size={12} /> Edit
          </Link>

          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/brochure/${listing.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold border border-[#1A2D40] text-[#A78BFA] hover:border-[#A78BFA] transition-colors"
            title="Download Brochure"
          >
            <FileDown size={12} />
          </a>
          <Link
            href={`/dashboard/qr?listing=${listing.id}`}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold border border-[#1A2D40] text-[#FFB830] hover:border-[#FFB830] transition-colors"
          >
            <QrCode size={12} />
          </Link>

          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center px-2 py-2 border border-[#1A2D40] text-[#4A6580] hover:text-white hover:border-[#4A6580] transition-colors"
            >
              <MoreVertical size={14} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 bottom-full mb-1 w-40 bg-[#111C28] border border-[#1A2D40] z-10 shadow-xl">
                {listing.status !== 'active' && (
                  <button
                    onClick={() => { onStatusChange(listing.id, 'active'); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-[#2ECC8A] hover:bg-[rgba(46,204,138,0.05)] transition-colors"
                  >
                    ✓ Mark Active
                  </button>
                )}
                {listing.status === 'active' && (
                  <button
                    onClick={() => { onStatusChange(listing.id, 'sold'); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-[#60A5FA] hover:bg-[rgba(96,165,250,0.05)] transition-colors"
                  >
                    Mark Sold
                  </button>
                )}
                <button
                  onClick={() => { handleDelete(); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-[#FF4D6A] hover:bg-[rgba(255,77,106,0.05)] transition-colors border-t border-[#1A2D40]"
                >
                  <span className="flex items-center gap-2"><Trash2 size={12} /> Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
