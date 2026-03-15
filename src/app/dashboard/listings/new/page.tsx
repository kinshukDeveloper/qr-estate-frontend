'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { listingsAPI } from '@/lib/listings';
import { ListingForm, type ListingFormData } from '@/components/listings/ListingForm';
import axios from 'axios';

export default function NewListingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: ListingFormData, amenities: string[]) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listingsAPI.create({
        ...data,
        bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
        area_sqft: data.area_sqft ? Number(data.area_sqft) : undefined,
        floor_number: data.floor_number ? Number(data.floor_number) : undefined,
        total_floors: data.total_floors ? Number(data.total_floors) : undefined,
        furnishing: data.furnishing || undefined,
        locality: data.locality || undefined,
        pincode: data.pincode || undefined,
        description: data.description || undefined,
        amenities,
      });

      const listingId = res.data.data.listing.id;
      router.push(`/dashboard/listings/${listingId}?created=true`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (data?.errors?.length) {
          setError(data.errors.map((e: { message: string }) => e.message).join(' · '));
        } else {
          setError(data?.message || 'Failed to create listing');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/listings" className="text-[#4A6580] hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">New Listing</h1>
          <p className="text-[#7A95AE] text-sm">Fill in property details to create a listing</p>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-[rgba(255,77,106,0.08)] border border-[rgba(255,77,106,0.2)] text-[#FF4D6A] text-sm">
          ⚠ {error}
        </div>
      )}

      <ListingForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
