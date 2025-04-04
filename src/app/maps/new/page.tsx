'use client';

import TriggerMapFlow from '@/components/TriggerMapFlow';

export default function NewMapPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Create New Map</h1>
        <TriggerMapFlow />
      </div>
    </div>
  );
} 