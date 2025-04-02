// src/app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import AuthButton from "@/components/AuthButton";
import TriggerMapFlow from "@/components/TriggerMapFlow";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-end mb-8">
        <AuthButton />
      </div>
      <TriggerMapFlow />
    </main>
  );
}