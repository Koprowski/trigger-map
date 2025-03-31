// src/app/page.tsx
import AuthButton from '@/components/AuthButton';
import TriggerMapBuilder from '@/components/TriggerMapBuilder';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';

export default async function HomePage() {
  const session = await getServerSession(authOptions); // Get session on server

  return (
    <main className="container mx-auto p-4 min-h-screen flex flex-col items-center">
      <header className="w-full flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Trigger Map Builder</h1>
        <AuthButton session={session} />
      </header>

      {session?.user ? (
         // Only show builder if logged in
        <TriggerMapBuilder userId={session.user.id}/>
      ) : (
        <p className="text-center text-lg mt-10">
          Please sign in to build your Trigger Map.
        </p>
      )}
       <footer className="mt-auto text-center text-sm text-gray-500 py-4">
         Built with TPF principles.
       </footer>
    </main>
  );
}