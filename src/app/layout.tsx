// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './providers'; // Import the SessionProvider wrapper

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trigger Map Builder',
  description: 'Map your habits and triggers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers> {/* Wrap children */}
            {children}
        </Providers>
      </body>
    </html>
  );
}