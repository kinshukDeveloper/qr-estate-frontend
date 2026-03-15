'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { type Listing } from '@/lib/listings';

const schema = z.object({
  title: z.string().min(5, 'Min 5 characters').max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
  property_type: z.enum(['apartment', 'villa', 'plot', 'commercial', 'pg', 'house']),
  listing_type: z.enum(['sale', 'rent']),
  price: z.coerce.number().min(1, 'Enter a valid price'),
  price_negotiable: z.boolean().optional(),
  bedrooms: z.coerce.number().int().min(0).max(20).optional().or(z.literal('')),
  bathrooms: z.coerce.number().int().min(0).max(20).optional().or(z.literal('')),
  area_sqft: z.coerce.number().min(1).optional().or(z.literal('')),
  floor_number: z.coerce.number().int().min(0).optional().or(z.literal('')),
  total_floors: z.coerce.number().int().min(1).optional().or(z.literal('')),
  furnishing: z.enum(['unfurnished', 'semi-furnished', 'fully-furnished']).optional().or(z.literal('')),
  address: z.string().min(5, 'Address required'),
  locality: z.string().optional().or(z.literal('')),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter 6-digit pincode').optional().or(z.literal('')),
  status: z.enum(['draft', 'active']).optional(),
});

export type ListingFormData = z.infer<typeof schema>;

const AMENITIES_LIST = [
  'Lift', 'Parking', 'Power Backup', 'Security', 'CCTV', 'Gym',
  'Swimming Pool', 'Clubhouse', 'Garden', 'Children Play Area',
  'Intercom', 'Fire Safety', 'Rainwater Harvesting', 'Solar',
  'Gas Pipeline', 'Water Storage', 'Servant Room',
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh',
];

interface Props {
  defaultValues?: Partial<Listing>;
  onSubmit: (data: ListingFormData, amenities: string[]) => Promise<void>;
  isLoading: boolean;
  isEdit?: boolean;
}

export function ListingForm({ defaultValues, onSubmit, isLoading, isEdit }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      property_type: defaultValues?.property_type || 'apartment',
      listing_type: defaultValues?.listing_type || 'sale',
      price: defaultValues?.price || undefined,
      price_negotiable: defaultValues?.price_negotiable || false,
      bedrooms: defaultValues?.bedrooms || '',
      bathrooms: defaultValues?.bathrooms || '',
      area_sqft: defaultValues?.area_sqft || '',
      floor_number: defaultValues?.floor_number || '',
      total_floors: defaultValues?.total_floors || '',
      furnishing: defaultValues?.furnishing || '',
      address: defaultValues?.address || '',
      locality: defaultValues?.locality || '',
      city: defaultValues?.city || '',
      state: defaultValues?.state || '',
      pincode: defaultValues?.pincode || '',
      status: defaultValues?.status === 'active' ? 'active' : 'draft',
    },
  });

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(defaultValues?.amenities || []);
  const watchedType = watch('property_type');
  const showRooms = !['plot', 'commercial'].includes(watchedType);

  function toggleAmenity(a: string) {
    setSelectedAmenities(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );
  }

  async function handleFormSubmit(data: ListingFormData) {
    await onSubmit(data, selectedAmenities);
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">

      {/* ── SECTION 1: BASIC INFO ─────────────────────────────── */}
      <FormSection title="Basic Information" tag="Step 1">
        <div className="grid gap-4">
          <Input
            label="Listing Title *"
            placeholder="e.g. 3 BHK Apartment in Sector 17, Chandigarh"
            error={errors.title?.message}
            {...register('title')}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Property Type *</label>
              <select className="input" {...register('property_type')}>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="plot">Plot / Land</option>
                <option value="commercial">Commercial</option>
                <option value="pg">PG / Hostel</option>
              </select>
              {errors.property_type && <p className="error-text">{errors.property_type.message}</p>}
            </div>
            <div>
              <label className="label">For Sale or Rent *</label>
              <select className="input" {...register('listing_type')}>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={4}
              placeholder="Describe the property — highlights, nearby landmarks, special features..."
              {...register('description')}
            />
            {errors.description && <p className="error-text">{errors.description.message}</p>}
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 2: PRICING ───────────────────────────────────── */}
      <FormSection title="Pricing" tag="Step 2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Price (₹) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A6580] font-bold text-sm">₹</span>
              <input
                type="number"
                className="input pl-7"
                placeholder="e.g. 5000000"
                {...register('price')}
              />
            </div>
            {errors.price && <p className="error-text">{errors.price.message}</p>}
          </div>
          <div className="flex flex-col justify-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('price_negotiable')} className="w-4 h-4 accent-[#00D4C8]" />
              <span className="text-sm text-[#7A95AE]">Price is negotiable</span>
            </label>
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 3: PROPERTY DETAILS ──────────────────────────── */}
      <FormSection title="Property Details" tag="Step 3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {showRooms && (
            <>
              <Input label="Bedrooms" type="number" placeholder="3" error={errors.bedrooms?.message} {...register('bedrooms')} />
              <Input label="Bathrooms" type="number" placeholder="2" error={errors.bathrooms?.message} {...register('bathrooms')} />
            </>
          )}
          <Input label="Area (sq.ft)" type="number" placeholder="1200" error={errors.area_sqft?.message} {...register('area_sqft')} />
          {showRooms && (
            <>
              <Input label="Floor Number" type="number" placeholder="4" error={errors.floor_number?.message} {...register('floor_number')} />
              <Input label="Total Floors" type="number" placeholder="10" error={errors.total_floors?.message} {...register('total_floors')} />
            </>
          )}
          {showRooms && (
            <div>
              <label className="label">Furnishing</label>
              <select className="input" {...register('furnishing')}>
                <option value="">Not specified</option>
                <option value="unfurnished">Unfurnished</option>
                <option value="semi-furnished">Semi-Furnished</option>
                <option value="fully-furnished">Fully Furnished</option>
              </select>
            </div>
          )}
        </div>
      </FormSection>

      {/* ── SECTION 4: LOCATION ──────────────────────────────────── */}
      <FormSection title="Location" tag="Step 4">
        <div className="grid gap-4">
          <Input
            label="Full Address *"
            placeholder="House No, Street, Area"
            error={errors.address?.message}
            {...register('address')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Locality / Area" placeholder="Sector 17" error={errors.locality?.message} {...register('locality')} />
            <Input label="City *" placeholder="Chandigarh" error={errors.city?.message} {...register('city')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">State *</label>
              <select className="input" {...register('state')}>
                <option value="">Select state</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="error-text">{errors.state.message}</p>}
            </div>
            <Input label="Pincode" placeholder="160017" error={errors.pincode?.message} {...register('pincode')} />
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 5: AMENITIES ─────────────────────────────────── */}
      <FormSection title="Amenities" tag="Step 5">
        <div className="flex flex-wrap gap-2">
          {AMENITIES_LIST.map(amenity => (
            <button
              key={amenity}
              type="button"
              onClick={() => toggleAmenity(amenity)}
              className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                selectedAmenities.includes(amenity)
                  ? 'border-[#00D4C8] text-[#00D4C8] bg-[rgba(0,212,200,0.08)]'
                  : 'border-[#1A2D40] text-[#7A95AE] hover:border-[#4A6580] hover:text-white'
              }`}
            >
              {selectedAmenities.includes(amenity) && '✓ '}{amenity}
            </button>
          ))}
        </div>
        {selectedAmenities.length > 0 && (
          <p className="text-xs text-[#4A6580] mt-2">{selectedAmenities.length} amenities selected</p>
        )}
      </FormSection>

      {/* ── SECTION 6: PUBLISH ───────────────────────────────────── */}
      <FormSection title="Publishing" tag="Step 6">
        <div>
          <label className="label">Save as</label>
          <div className="flex gap-3">
            {(['draft', 'active'] as const).map(s => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value={s} {...register('status')} className="accent-[#00D4C8]" />
                <span className="text-sm text-[#7A95AE] capitalize">
                  {s === 'draft' ? '📝 Draft (save privately)' : '✅ Active (publish now)'}
                </span>
              </label>
            ))}
          </div>
        </div>
      </FormSection>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={isLoading} size="lg">
          {isEdit ? 'Save Changes' : 'Create Listing'}
        </Button>
        <a href="/dashboard/listings">
          <Button type="button" variant="outline" size="lg">Cancel</Button>
        </a>
      </div>

    </form>
  );
}

function FormSection({ title, tag, children }: { title: string; tag: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111C28] border border-[#1A2D40] p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#1A2D40]">
        <span className="text-[9px] font-bold tracking-widest text-[#00D4C8] bg-[rgba(0,212,200,0.08)] px-2 py-1 uppercase">{tag}</span>
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// need useState for amenities
import { useState } from 'react';
