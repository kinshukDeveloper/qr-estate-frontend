import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'QR Estate — Smart Property Listings',
    template: '%s | QR Estate',
  },
  description: 'India\'s first QR-native real estate listing platform. Generate, share and track QR codes for every property listing.',
  keywords: ['real estate', 'QR code', 'property listing', 'India', 'RERA'],
  openGraph: {
    title: 'QR Estate',
    description: 'Smart QR-based property listings for Indian real estate agents',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrains.variable}`}>
      <body className="bg-brand-bg text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
