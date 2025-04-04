'use client';

import { signIn, getProviders } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import SignInComponent from "./SignInComponent";

function SignInContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSignIn = async () => {
    await signIn('google', {
      callbackUrl,
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          {error === 'OAuthAccountNotLinked' && (
            <p className="mt-2 text-center text-sm text-red-600">
              To confirm your identity, sign in with the same account you used originally.
            </p>
          )}
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={handleSignIn}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default async function SignIn() {
  const providers = await getProviders();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-4xl font-bold">Sign In</h1>
        <SignInComponent providers={providers} />
      </div>
    </div>
  );
} 