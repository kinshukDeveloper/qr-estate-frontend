import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PropertyPageClient } from './PropertyPageClient';

interface Props {
  params: { shortCode: string };
  searchParams: { unavailable?: string };
}

async function getListing(shortCode: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/p/${shortCode}`,
      { next: { revalidate: 60 } } // ISR — revalidate every 60 seconds
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data.listing;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing(params.shortCode);
  if (!listing) return { title: 'Property Not Found' };

  return {
    title: `${listing.title} — QR Estate`,
    description: listing.description || `${listing.property_type} for ${listing.listing_type} in ${listing.city}`,
    openGraph: {
      title: listing.title,
      description: `₹${Number(listing.price).toLocaleString('en-IN')} · ${listing.city}`,
      images: listing.images?.[0]?.url ? [listing.images[0].url] : [],
    },
  };
}

export default async function PropertyPage({ params, searchParams }: Props) {
  const listing = await getListing(params.shortCode);
  if (!listing) notFound();

  return (
    <PropertyPageClient
      listing={listing}
      isUnavailable={searchParams.unavailable === 'true'}
    />
  );
}
