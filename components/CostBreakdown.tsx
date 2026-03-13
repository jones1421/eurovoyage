'use client';

import { TripItinerary } from '@/lib/types';
import { DollarSign } from 'lucide-react';

interface Props {
  costs: TripItinerary['totalEstimatedCost'];
}

export default function CostBreakdown({ costs }: Props) {
  const items = [
    { label: 'Flights', amount: costs.flights, color: 'bg-blue-500', icon: '✈️' },
    { label: 'Accommodations', amount: costs.accommodations, color: 'bg-indigo-500', icon: '🏨' },
    { label: 'Food & Activities (est.)', amount: costs.estimatedDaily, color: 'bg-purple-500', icon: '🍽️' },
  ];

  return (
    <div className="rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
        <DollarSign className="h-4 w-4 text-[#ff6b6b]" /> Estimated Total Cost
      </h3>
      <div className="space-y-3">
        {items.map((item) => {
          const pct = Math.round((item.amount / costs.total) * 100);
          return (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{item.icon} {item.label}</span>
                <span className="font-medium text-gray-800">${item.amount.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <span className="font-bold text-gray-800">Total Estimate</span>
          <span className="font-bold text-xl text-[#1e3a5f]">${costs.total.toLocaleString()}</span>
        </div>
        <p className="text-xs text-gray-400">* Estimates based on typical prices. Actual costs may vary.</p>
      </div>
    </div>
  );
}
