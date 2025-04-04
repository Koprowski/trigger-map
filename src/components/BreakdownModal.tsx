// src/components/BreakdownModal.tsx
'use client';

import React, { useState } from 'react';

interface BreakdownModalProps {
  initialStep: string;
  onClose: () => void;
  onSave: (brokenDownStep: string) => void;
}

export default function BreakdownModal({ initialStep, onClose, onSave }: BreakdownModalProps) {
    const [editedStep, setEditedStep] = useState(initialStep);

    const handleSave = () => {
        if (editedStep.trim()) {
           onSave(editedStep.trim());
        }
    };

    return (
         // Basic Modal Structure (you might want a dedicated library like Headless UI later)
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
             <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg mx-4">
                 <h2 className="text-xl font-semibold mb-4">Break Down Your Step</h2>
                 <p className="text-sm text-gray-600 mb-2">Your step: "{initialStep}" seems like it might take more than 2 minutes.</p>
                 <p className="text-sm text-gray-600 mb-4">Try making it more specific or breaking it into a smaller first action. Think: What is the *very first physical action* you would take?</p>
                 <label htmlFor="breakdownStep" className="block text-sm font-medium text-gray-700">
                    Revised Step (should take &lt; 2 minutes):
                 </label>
                 <textarea
                    id="breakdownStep"
                    rows={3}
                    value={editedStep}
                    onChange={(e) => setEditedStep(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., Open YouTube app, Put running shoes by the door, Fill water bottle"
                 />
                 <div className="mt-6 flex justify-end gap-3">
                     <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                      >
                         Cancel
                     </button>
                     <button
                        onClick={handleSave}
                        disabled={!editedStep.trim()}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                         Save Revised Step
                     </button>
                 </div>
             </div>
         </div>
    );
}