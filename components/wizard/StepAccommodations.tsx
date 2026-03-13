'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AccommodationResult, DestinationRecommendation, TripPreferences } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import AccommodationCard from '@/components/AccommodationCard';

interface Props {
  preferences: Partial<TripPreferences>;
  destinations: DestinationRecommendation[];
  selectedAccommodations: { cityName: string; accommodation: AccommodationResult }[];
  onSelectAccommodation: (cityName: string, acc: AccommodationResult) => void;
  onNext: () => void;
  onBack: () => void;
}

function getCheckIn(month: number, year: number, dayOffset = 10): string {
  return new Date(year, month - 1, dayOffset).toISOString().split('T')[0];
}

function getCheckOut(checkIn: string, days: number): string {
  const d = new Date(checkIn);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function StepAccommodations({
  preferences, destinations, selectedAccommodations, onSelectAccommodation, onNext, onBack,
}: Props) {
  const [cityAccommodations, setCityAccommodations] = useState<Record<string, AccommodationResult[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchForCity = async (dest: DestinationRecommendation, city: DestinationRecommendation['cities'][0]) => {
    const key = city.cityName;
    setLoading((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: '' }));

    const month = preferences.travelMonth ?? 6;
    const year = preferences.travelYear ?? new Date().getFullYear() + 1;
    const checkIn = getCheckIn(month, year);
    const checkOut = getCheckOut(checkIn, city.daysRecommended ?? 3);

    try {
      const res = await fetch('/api/accommodations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: city.cityName,
          checkIn,
          checkOut,
          adults: preferences.numberOfTravelers ?? 1,
          maxPerNight: preferences.maxAccommodationPerNight ?? 200,
          tripStyle: preferences.tripStyle ?? ['culture'],
          topAttractions: city.topAttractions ?? [],
          daysInCity: city.daysRecommended ?? 3,
        }),
      });
      const data = await res.json();
      if (data.accommodations) {
        setCityAccommodations((prev) => ({ ...prev, [key]: data.accommodations }));
      } else {
        setErrors((prev) => ({ ...prev, [key]: data.error ?? 'Failed to load' }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, [key]: 'Connection error' }));
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const allCitiesSelected = destinations.every((dest) =>
    dest.cities.every((city) => selectedAccommodations.some((a) => a.cityName === city.cityName))
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#1e3a5f]">Where to Stay</h2>
        <p className="text-sm text-gray-500 mt-1">Budget: ${preferences.maxAccommodationPerNight ?? 200}/night · AI-curated picks</p>
      </div>

      {destinations.map((dest) =>
        dest.cities.map((city) => {
          const key = city.cityName;
          const accommodations = cityAccommodations[key];
          const isLoading = loading[key];
          const err = errors[key];
          const selectedForCity = selectedAccommodations.find((a) => a.cityName === key);

          return (
            <div key={key} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  {city.cityName} · {city.daysRecommended} nights
                </h3>
                {!accommodations && (
                  <Button
                    size="sm"
                    onClick={() => fetchForCity(dest, city)}
                    disabled={isLoading}
                    className="bg-[#1e3a5f]"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : '🏨 Find Hotels'}
                  </Button>
                )}
              </div>

              {err && <p className="text-sm text-red-600">{err}</p>}

              {isLoading && !accommodations && (
                <div className="flex items-center gap-3 text-gray-400 py-8 justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]" />
                  <span className="text-sm">Finding the best places to stay…</span>
                </div>
              )}

              {accommodations && (
                <div className="grid gap-3">
                  {accommodations.map((acc, i) => (
                    <AccommodationCard
                      key={i}
                      accommodation={acc}
                      isSelected={selectedForCity?.accommodation === acc}
                      onSelect={() => onSelectAccommodation(key, acc)}
                      nights={city.daysRecommended ?? 3}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button
          onClick={onNext}
          disabled={!allCitiesSelected && selectedAccommodations.length === 0}
          className="bg-[#ff6b6b] hover:bg-[#ff5252] text-white"
        >
          Review My Trip →
        </Button>
      </div>
    </div>
  );
}
