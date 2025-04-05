'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export default function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow-sm">
      <Link href="/" className="text-xl font-bold">
        Trigger Map
      </Link>
      <div className="flex items-center space-x-4">
        {session?.user && (
          <>
            <Link href="/maps" className="text-gray-600 hover:text-gray-900">
              My Maps
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
} 