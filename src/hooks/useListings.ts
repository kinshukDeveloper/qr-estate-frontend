'use client';

import { useState, useEffect, useCallback } from 'react';
import { listingsAPI, type Listing, type ListingFilters } from '@/lib/listings';
import axios from 'axios';

export function useListings(initialFilters?: ListingFilters) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ListingFilters>(initialFilters || {});

  const fetchListings = useCallback(async (f?: ListingFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listingsAPI.getAll(f || filters);
      setListings(res.data.data.listings);
      setPagination(res.data.data.pagination);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load listings');
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchListings(); }, []);

  function applyFilters(newFilters: ListingFilters) {
    const merged = { ...filters, ...newFilters, page: 1 };
    setFilters(merged);
    fetchListings(merged);
  }

  function changePage(page: number) {
    const updated = { ...filters, page };
    setFilters(updated);
    fetchListings(updated);
  }

  async function deleteListing(id: string) {
    await listingsAPI.delete(id);
    setListings(prev => prev.filter(l => l.id !== id));
  }

  async function updateStatus(id: string, status: string) {
    const res = await listingsAPI.updateStatus(id, status);
    setListings(prev => prev.map(l =>
      l.id === id ? { ...l, status: res.data.data.listing.status } : l
    ));
  }

  return {
    listings, pagination, isLoading, error,
    filters, applyFilters, changePage,
    deleteListing, updateStatus,
    refetch: fetchListings,
  };
}
