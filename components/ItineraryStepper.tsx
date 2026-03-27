'use client';

import { WizardStep } from '@/lib/types';

const STEPS: { id: WizardStep; label: string; emoji: string }[] = [
  { id: 'preferences', label: 'Preferences', emoji: '🎯' },
  { id: 'destinations', label: 'Destinations', emoji: '🗺️' },
  { id: 'flights', label: 'Flights', emoji: '✈️' },
  { id: 'accommodations', label: 'Stay', emoji: '🏨' },
  { id: 'review', label: 'Review', emoji: '✨' },
];

interface Props {
  currentStep: WizardStep;
}

export default function ItineraryStepper({ currentStep }: Props) {
  const currentIdx = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, i) => {
        const isCompleted = i < currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isCompleted
                    ? 'bg-[#1e3a5f] text-white'
                    : isCurrent
                    ? 'bg-[#ff6b6b] text-white ring-4 ring-red-100'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isCompleted ? '✓' : step.emoji}
              </div>
              <span
                className={`text-xs hidden sm:block ${
                  isCurrent ? 'text-[#ff6b6b] font-semibold' : isCompleted ? 'text-[#1e3a5f]' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-1 mb-4 transition-all ${
                  i < currentIdx ? 'bg-[#1e3a5f]' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
