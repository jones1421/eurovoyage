import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EuroVoyage — European Travel Planner',
  description: 'Plan your perfect European trip with AI-powered destination recommendations, real-time flight pricing, and curated accommodations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#f8f9fa] min-h-screen`}>
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-[#1e3a5f] text-lg">
              🌍 EuroVoyage
            </Link>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <Link href="/plan" className="bg-[#ff6b6b] text-white px-4 py-1.5 rounded-full font-medium hover:bg-[#ff5252] transition">
                Plan a Trip
              </Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
