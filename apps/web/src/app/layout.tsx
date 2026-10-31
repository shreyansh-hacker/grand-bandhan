import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Grand Bandhan – Imperial Wedding Planning & Operations Management Platform',
  description:
    'Luxury Wedding Planning and Operations Management. End-to-end wedding lifecycle from multi-channel enquiries and quotation comparison to instant 25+ milestone planning, day-of live coordination, and post-wedding settlement.',
  keywords: [
    'Wedding Planning',
    'Royal Indian Weddings',
    'Wedding Operations Management',
    'Quotation Comparison',
    'Event Scheduling',
    'Grand Bandhan',
  ],
};

import RoyalLoader from '@/components/RoyalLoader';
import SmoothScroll from '@/components/SmoothScroll';
import PageTransition from '@/components/PageTransition';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-navy-950">
      <body className="min-h-screen bg-navy-950 text-darkText antialiased selection:bg-gold selection:text-navy-900 font-sans">
        {/* Luxury Grand Bandhan 3-4s Loading Screen */}
        <RoyalLoader />

        {/* Global Smooth Scrolling Engine with Sticky Header Offset */}
        <SmoothScroll />

        {/* Seamless Page Transitions Across Routes */}
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
