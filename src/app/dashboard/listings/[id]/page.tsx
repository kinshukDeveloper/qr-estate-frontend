'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Trash2, QrCode, FileDown } from 'lucide-react';
import Link from 'next/link';
import { listingsAPI, type Listing } from '@/lib/listings';
import { ListingForm, type ListingFormData } from '@/components/listings/ListingForm';
import { Button } from '@/components/ui/Button';
import axios from 'axios';

export default function EditListingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewlyCreated = searchParams.get('created') === 'true';

  const [listing, setListing] = useState<Listing | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(isNewlyCreated ? '🎉 Listing created! Add images or generate a QR code.' : null);

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await listingsAPI.getOne(params.id);
        setListing(res.data.data.listing);
      } catch (err) {
        setError('Listing not found or you do not have access.');
      } finally {
        setIsFetching(false);
      }
    }
    fetchListing();
  }, [params.id]);

  async function handleSubmit(data: ListingFormData, amenities: string[]) {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await listingsAPI.update(params.id, {
        ...data,
        bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
        area_sqft: data.area_sqft ? Number(data.area_sqft) : undefined,
        floor_number: data.floor_number ? Number(data.floor_number) : undefined,
        total_floors: data.total_floors ? Number(data.total_floors) : undefined,
        furnishing: data.furnishing || undefined,
        amenities,
      });
      setListing(res.data.data.listing);
      setSuccessMsg('✓ Changes saved.');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to update');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this listing permanently? This cannot be undone.')) return;
    try {
      await listingsAPI.delete(params.id);
      router.push('/dashboard/listings');
    } catch {
      setError('Failed to delete listing.');
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    try {
      const res = await listingsAPI.uploadImages(params.id, files);
      setListing(prev => prev ? { ...prev, images: res.data.data.listing.images } : prev);
      setSuccessMsg(`✓ ${files.length} image(s) uploaded.`);
    } catch (err) {
      setError('Image upload failed. Make sure Cloudinary is configured in .env');
    }
  }

  if (isFetching) {
    return (
      <div className="max-w-2xl space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#111C28] border border-[#1A2D40] h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="max-w-2xl">
        <div className="px-4 py-8 text-center text-[#FF4D6A] border border-[rgba(255,77,106,0.2)] bg-[rgba(255,77,106,0.05)]">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/listings" className="text-[#4A6580] hover:text-white transition-colors mt-1">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">Edit Listing</h1>
            <p className="text-[#7A95AE] text-sm truncate max-w-xs">{listing?.title}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/dashboard/qr?listing=${params.id}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <QrCode size={13} /> QR Code
            </Button>
          </Link>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/brochure/${params.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <FileDown size={13} /> Brochure
            </Button>
          </a>
          <Button variant="danger" size="sm" onClick={handleDelete} className="flex items-center gap-1.5">
            <Trash2 size={13} /> Delete
          </Button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="px-4 py-3 bg-[rgba(46,204,138,0.08)] border border-[rgba(46,204,138,0.2)] text-[#2ECC8A] text-sm">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 bg-[rgba(255,77,106,0.08)] border border-[rgba(255,77,106,0.2)] text-[#FF4D6A] text-sm">
          ⚠ {error}
        </div>
      )}

      {/* Image upload section */}
      <div className="bg-[#111C28] border border-[#1A2D40] p-5">
        <div className="text-[10px] font-bold tracking-widest text-[#FFB830] uppercase mb-1">Photos</div>
        <h2 className="text-sm font-bold text-white mb-4">Property Images</h2>

        {/* Existing images */}
        {listing?.images && listing.images.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {listing.images.map(img => (
              <div key={img.public_id} className="relative group w-20 h-20">
                <img src={img.url} className="w-full h-full object-cover" alt="" />
                {img.is_primary && (
                  <div className="absolute bottom-0 left-0 right-0 bg-[#00D4C8] text-[#080F17] text-[8px] font-bold text-center py-0.5">
                    PRIMARY
                  </div>
                )}
                <button
                  onClick={async () => {
                    await listingsAPI.deleteImage(params.id, img.public_id);
                    setListing(prev => prev ? {
                      ...prev,
                      images: prev.images.filter(i => i.public_id !== img.public_id)
                    } : prev);
                  }}
                  className="absolute top-1 right-1 w-5 h-5 bg-[#FF4D6A] text-white text-xs items-center justify-center hidden group-hover:flex"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <div className="px-4 py-2 border border-dashed border-[#1A2D40] text-xs text-[#7A95AE] hover:border-[#00D4C8] hover:text-[#00D4C8] transition-colors">
            + Upload Images (JPEG, PNG, WebP — max 10MB each)
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
        <p className="text-xs text-[#4A6580] mt-2">
          {listing?.images?.length || 0} / 10 images uploaded.
          {!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && ' Add Cloudinary keys to .env to enable uploads.'}
        </p>
      </div>

      {/* Edit form */}
      {listing && (
        <ListingForm
          defaultValues={listing}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isEdit
        />
      )}
    </div>
  );
}
