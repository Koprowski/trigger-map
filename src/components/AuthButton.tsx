// src/components/AuthButton.tsx
'use client';

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
         {session.user.image && (
            <img src={session.user.image} alt="User profile" className="w-8 h-8 rounded-full" />
         )}
         <span className="text-sm hidden sm:inline">{session.user.name || session.user.email}</span>
        <button
          onClick={() => signOut()}
          className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
    >
      Sign In
    </button>
  );
}