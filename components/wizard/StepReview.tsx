'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WizardState, TripItinerary } from '@/lib/types';
import { Loader2, ExternalLink, MapPin, Plane, Hotel, DollarSign } from 'lucide-react';
import CostBreakdown from '@/components/CostBreakdown';

interface Props {
  state: WizardState;
  itinerary: TripItinerary | null;
  onGenerate: (itinerary: TripItinerary) => void;
  onBack: () => void;
}

export default function StepReview({ state, itinerary, onGenerate, onBack }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { preferences, selectedDestinations, flightOptions, selectedAccommodations } = state;

  const generateItinerary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      const data = await res.json();
      if (data.itinerary) onGenerate(data.itinerary);
      else setError(data.error ?? 'Failed to generate itinerary');
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const monthName = preferences.travelMonth
    ? new Date(2000, preferences.travelMonth - 1, 1).toLocaleString('en', { month: 'long' })
    : '';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1e3a5f]">Your Trip Summary</h2>
        <p className="text-sm text-gray-500 mt-1">
          {monthName} {preferences.travelYear} · {preferences.durationDays} days
        </p>
      </div>

      {/* Destinations */}
      <div className="rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#ff6b6b]" /> Destinations
        </h3>
        {selectedDestinations.map((dest, i) => (
          <div key={i}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{getFlagEmoji(dest.countryCode)}</span>
              <span className="font-medium text-gray-800">{dest.country}</span>
              <Badge variant="outline" className="text-xs">{dest.avgTemperatureF}°F avg</Badge>
            </div>
            <div className="ml-8 mt-1 space-y-1">
              {dest.cities.map((city, j) => (
                <div key={j} className="text-sm text-gray-600">
                  {city.cityName} ({city.iataCode}) · {city.daysRecommended} nights
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Flights */}
      {flightOptions && (
        <div className="rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Plane className="h-4 w-4 text-[#ff6b6b]" /> Flights
          </h3>
          <p className="text-sm text-gray-600">{flightOptions.recommendation}</p>
          <p className="text-sm text-gray-500">{flightOptions.budgetAssessment}</p>
          <div className="flex flex-wrap gap-2">
            {flightOptions.estimates.map((e, i) => (
              <a
                key={i}
                href={e.googleFlightsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#1e3a5f] border border-[#1e3a5f] rounded-full px-3 py-1 hover:bg-blue-50 transition"
              >
                <ExternalLink className="h-3 w-3" />
                {e.origin} → {e.destination} on Kayak
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Accommodations */}
      {selectedAccommodations.length > 0 && (
        <div className="rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Hotel className="h-4 w-4 text-[#ff6b6b]" /> Accommodations
          </h3>
          {selectedAccommodations.map((a, i) => (
            <div key={i} className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-800">{a.accommodation.name}</p>
                <p className="text-xs text-gray-500">{a.cityName} · {a.accommodation.neighborhood}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">${a.accommodation.pricePerNight}/night</p>
                <p className="text-xs text-gray-500">⭐ {a.accommodation.rating}/10</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Trip Summary */}
      {itinerary && (
        <div className="space-y-4">
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-5">
            <p className="text-sm font-semibold text-blue-900 mb-2">✨ Your Trip</p>
            <p className="text-sm text-blue-800 leading-relaxed">{itinerary.aiTripSummary}</p>
          </div>

          <CostBreakdown costs={itinerary.totalEstimatedCost} />

          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <ExternalLink className="h-4 w-4 text-[#ff6b6b]" /> Book Your Trip
            </h3>
            <div className="flex flex-wrap gap-2">
              {itinerary.flights.googleFlightsLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-[#1e3a5f] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2d4f7a] transition"
                >
                  ✈️ {link.airport} on Kayak
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">{error}</div>
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        {!itinerary && (
          <Button
            onClick={generateItinerary}
            disabled={loading}
            className="bg-[#ff6b6b] hover:bg-[#ff5252] text-white"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating…</> : '✨ Generate My Itinerary'}
          </Button>
        )}
        {itinerary && (
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="border-[#1e3a5f] text-[#1e3a5f]"
          >
            🖨️ Print / Save
          </Button>
        )}
      </div>
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  if (!countryCode) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
