'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Home, RefreshCw } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { ListingCard } from '@/components/listings/ListingCard';
import { Button } from '@/components/ui/Button';

const STATUSES = ['all', 'active', 'draft', 'sold', 'rented', 'inactive'];
const PROPERTY_TYPES = ['all', 'apartment', 'villa', 'house', 'plot', 'commercial', 'pg'];

export default function ListingsPage() {
  const {
    listings, pagination, isLoading, error,
    applyFilters, changePage, deleteListing, updateStatus,
  } = useListings();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilters({ search: search || undefined });
  }

  function handleStatusFilter(status: string) {
    setStatusFilter(status);
    applyFilters({ status: status === 'all' ? undefined : status });
  }

  function handleTypeFilter(type: string) {
    setTypeFilter(type);
    applyFilters({ property_type: type === 'all' ? undefined : type });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Listings</h1>
          <p className="text-[#7A95AE] text-sm mt-0.5">
            {pagination ? `${pagination.total} total` : 'Manage your properties'}
          </p>
        </div>
        <Link href="/dashboard/listings/new">
          <Button size="sm" className="flex items-center gap-2 whitespace-nowrap">
            <Plus size={14} /> New Listing
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A6580]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, address, locality..."
              className="input pl-9 py-2.5 text-sm"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">Search</Button>
        </form>

        {/* Status tabs */}
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-bold tracking-widest uppercase transition-colors ${
                statusFilter === s
                  ? 'bg-[#00D4C8] text-[#080F17]'
                  : 'bg-[#111C28] border border-[#1A2D40] text-[#7A95AE] hover:text-white hover:border-[#4A6580]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex gap-1 flex-wrap">
          {PROPERTY_TYPES.map(t => (
            <button
              key={t}
              onClick={() => handleTypeFilter(t)}
              className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase transition-colors ${
                typeFilter === t
                  ? 'bg-[#FFB830] text-[#080F17]'
                  : 'border border-[#1A2D40] text-[#4A6580] hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-[rgba(255,77,106,0.08)] border border-[rgba(255,77,106,0.2)] text-[#FF4D6A] text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-[#111C28] border border-[#1A2D40] h-72 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && listings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 border-2 border-dashed border-[#1A2D40] flex items-center justify-center mb-4">
            <Home size={24} className="text-[#4A6580]" />
          </div>
          <h3 className="font-bold text-white mb-2">No listings yet</h3>
          <p className="text-[#4A6580] text-sm mb-6">Create your first property listing to get started</p>
          <Link href="/dashboard/listings/new">
            <Button>
              <Plus size={14} className="mr-2" /> Create First Listing
            </Button>
          </Link>
        </div>
      )}

      {/* Grid */}
      {!isLoading && listings.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onDelete={deleteListing}
                onStatusChange={updateStatus}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-[#1A2D40]">
              <span className="text-xs text-[#4A6580]">
                Page {pagination.page} of {pagination.total_pages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.has_prev}
                  onClick={() => changePage(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.has_next}
                  onClick={() => changePage(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
