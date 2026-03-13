'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DestinationRecommendation, TripPreferences } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import DestinationCard from '@/components/DestinationCard';

interface Props {
  preferences: Partial<TripPreferences>;
  destinations: DestinationRecommendation[];
  selected: DestinationRecommendation[];
  onSelect: (dest: DestinationRecommendation) => void;
  onLoad: (dests: DestinationRecommendation[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepDestinations({
  preferences, destinations, selected, onSelect, onLoad, onNext, onBack,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDestinations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      const data = await res.json();
      if (data.destinations) onLoad(data.destinations);
      else setError(data.error ?? 'Failed to load destinations');
    } catch {
      setError('Failed to connect. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1e3a5f]">Choose Your Destination</h2>
          <p className="text-sm text-gray-500 mt-1">
            Select up to {preferences.numberOfCities ?? 2} destinations
          </p>
        </div>
        {destinations.length === 0 && (
          <Button onClick={fetchDestinations} disabled={loading} className="bg-[#1e3a5f]">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading…</> : '✨ Get AI Recommendations'}
          </Button>
        )}
        {destinations.length > 0 && (
          <Button variant="outline" onClick={fetchDestinations} disabled={loading} size="sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '↻ Refresh'}
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">{error}</div>
      )}

      {loading && destinations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
          <Loader2 className="h-10 w-10 animate-spin text-[#1e3a5f]" />
          <p className="text-sm">Claude is finding your perfect European destinations…</p>
        </div>
      )}

      {destinations.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {destinations.map((dest, i) => (
            <DestinationCard
              key={i}
              destination={dest}
              isSelected={selected.some((s) => s.country === dest.country)}
              onSelect={() => onSelect(dest)}
              maxCities={preferences.numberOfCities ?? 2}
              currentSelected={selected.length}
            />
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button
          onClick={onNext}
          disabled={selected.length === 0}
          className="bg-[#ff6b6b] hover:bg-[#ff5252] text-white"
        >
          Find Flights →
        </Button>
      </div>
    </div>
  );
}
