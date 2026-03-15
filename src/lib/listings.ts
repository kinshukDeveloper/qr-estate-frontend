import api from './api';

export interface Listing {
  id: string;
  agent_id: string;
  title: string;
  description?: string;
  property_type: 'apartment' | 'villa' | 'plot' | 'commercial' | 'pg' | 'house';
  listing_type: 'sale' | 'rent';
  price: number;
  price_negotiable: boolean;
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  floor_number?: number;
  total_floors?: number;
  furnishing?: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
  facing?: string;
  address: string;
  locality?: string;
  city: string;
  state: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  images: { url: string; public_id: string; is_primary: boolean }[];
  amenities: string[];
  status: 'draft' | 'active' | 'sold' | 'rented' | 'inactive';
  view_count: number;
  short_code: string;
  created_at: string;
  updated_at: string;
  agent_name?: string;
  agent_phone?: string;
  agent_rera?: string;
}

export interface ListingFilters {
  page?: number;
  limit?: number;
  status?: string;
  property_type?: string;
  listing_type?: string;
  city?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
}

export interface CreateListingPayload {
  title: string;
  description?: string;
  property_type: string;
  listing_type: string;
  price: number;
  price_negotiable?: boolean;
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
  latitude?: number;
  longitude?: number;
  amenities?: string[];
  status?: 'draft' | 'active';
}

export const listingsAPI = {
  create: (data: CreateListingPayload) =>
    api.post('/listings', data),

  getAll: (filters?: ListingFilters) =>
    api.get('/listings', { params: filters }),

  getOne: (id: string) =>
    api.get(`/listings/${id}`),

  update: (id: string, data: Partial<CreateListingPayload>) =>
    api.patch(`/listings/${id}`, data),

  delete: (id: string) =>
    api.delete(`/listings/${id}`),

  updateStatus: (id: string, status: string) =>
    api.patch(`/listings/${id}/status`, { status }),

  uploadImages: (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    return api.post(`/listings/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteImage: (id: string, public_id: string) =>
    api.delete(`/listings/${id}/images`, { data: { public_id } }),

  getStats: () =>
    api.get('/listings/stats'),
};
