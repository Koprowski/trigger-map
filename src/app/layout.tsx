// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './providers'; // Import the SessionProvider wrapper
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trigger Map Builder',
  description: 'Map your habits and triggers',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Providers>
          <nav className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-gray-800">
                  Trigger Map
                </Link>
                <div className="space-x-4">
                  <Link
                    href="/maps"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    My Maps
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  );
}