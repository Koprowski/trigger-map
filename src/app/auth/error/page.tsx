'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errors: { [key: string]: string } = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification link was invalid or has expired.",
    OAuthAccountNotLinked: "To confirm your identity, sign in with the same account you used originally.",
    default: "An error occurred during authentication.",
  };

  const errorMessage = error ? errors[error] || errors.default : errors.default;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-red-600">Authentication Error</h1>
        <p className="text-xl">{errorMessage}</p>
        <Link
          href="/auth/signin"
          className="inline-block px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
} 