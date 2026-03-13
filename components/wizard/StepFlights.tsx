'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DestinationRecommendation, FlightOptions, TripPreferences } from '@/lib/types';
import { Loader2, ExternalLink } from 'lucide-react';
import FlightResultCard from '@/components/FlightResultCard';

interface Props {
  preferences: Partial<TripPreferences>;
  destinations: DestinationRecommendation[];
  flightOptions: FlightOptions | null;
  onFlightOptions: (opts: FlightOptions) => void;
  onNext: () => void;
  onBack: () => void;
}

function getDepartureDate(month: number, year: number): string {
  const date = new Date(year, month - 1, 10);
  return date.toISOString().split('T')[0];
}

function getReturnDate(departure: string, days: number): string {
  const d = new Date(departure);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function StepFlights({
  preferences, destinations, flightOptions, onFlightOptions, onNext, onBack,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingLive, setLoadingLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null);

  const primaryDest = destinations[0];
  const primaryCity = primaryDest?.cities[0];

  const departureDate = getDepartureDate(
    preferences.travelMonth ?? 6,
    preferences.travelYear ?? new Date().getFullYear() + 1
  );
  const returnDate = getReturnDate(departureDate, preferences.durationDays ?? 10);

  const fetchEstimates = async () => {
    if (!primaryCity) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originAirports: preferences.departureAirports ?? ['PHL'],
          destinationAirport: primaryCity.iataCode,
          destinationCity: primaryCity.cityName,
          departureDate,
          returnDate,
          adults: preferences.numberOfTravelers ?? 1,
          maxBudgetPerPerson: preferences.maxFlightBudgetPerPerson ?? 2500,
          mode: 'estimate',
        }),
      });
      const data = await res.json();
      if (data.routes) {
        onFlightOptions({
          destination: primaryCity.iataCode,
          destinationCity: primaryCity.cityName,
          estimates: data.routes,
          recommendation: data.recommendation,
          budgetAssessment: data.budgetAssessment,
          isWithinBudget: data.isWithinBudget,
        });
        setRemainingRequests(data.remainingRequests);
      } else {
        setError(data.error ?? 'Failed to load flight estimates');
      }
    } catch {
      setError('Failed to connect.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLivePrices = async () => {
    if (!primaryCity) return;
    setLoadingLive(true);
    setError(null);
    try {
      const res = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originAirports: preferences.departureAirports ?? ['PHL'],
          destinationAirport: primaryCity.iataCode,
          destinationCity: primaryCity.cityName,
          departureDate,
          returnDate,
          adults: preferences.numberOfTravelers ?? 1,
          maxBudgetPerPerson: preferences.maxFlightBudgetPerPerson ?? 2500,
          mode: 'live',
        }),
      });
      const data = await res.json();
      if (data.liveResults) {
        onFlightOptions({ ...flightOptions!, liveResults: data.liveResults });
        setRemainingRequests(data.remainingRequests);
      } else {
        setError(data.error ?? 'Failed to fetch live prices');
      }
    } catch {
      setError('Failed to fetch live prices.');
    } finally {
      setLoadingLive(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1e3a5f]">Flight Options</h2>
          <p className="text-sm text-gray-500 mt-1">
            {primaryCity?.cityName} ({primaryCity?.iataCode}) · {departureDate} → {returnDate}
          </p>
        </div>
        {!flightOptions && (
          <Button onClick={fetchEstimates} disabled={loading} className="bg-[#1e3a5f]">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading…</> : '✈️ Get Flight Estimates'}
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">{error}</div>
      )}

      {loading && !flightOptions && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
          <Loader2 className="h-10 w-10 animate-spin text-[#1e3a5f]" />
          <p className="text-sm">Claude is analyzing flight options…</p>
        </div>
      )}

      {flightOptions && (
        <div className="space-y-4">
          {/* AI recommendation banner */}
          {flightOptions.recommendation && (
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm font-semibold text-blue-900">✨ AI Recommendation</p>
              <p className="text-sm text-blue-800 mt-1">{flightOptions.recommendation}</p>
              <p className="text-sm text-blue-700 mt-1">{flightOptions.budgetAssessment}</p>
            </div>
          )}

          {/* Per-airport results */}
          <div className="grid gap-3">
            {flightOptions.estimates.map((estimate, i) => (
              <FlightResultCard
                key={i}
                estimate={estimate}
                liveResults={flightOptions.liveResults?.filter((r) => r.origin === estimate.origin)}
                maxBudget={preferences.maxFlightBudgetPerPerson ?? 2500}
              />
            ))}
          </div>

          {/* Live prices button */}
          {!flightOptions.liveResults && (
            <div className="rounded-xl border border-dashed border-gray-300 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Want real-time prices?</p>
                <p className="text-xs text-gray-400">
                  Uses 1 of {remainingRequests ?? '?'} remaining searches this month
                </p>
              </div>
              <Button
                variant="outline"
                onClick={fetchLivePrices}
                disabled={loadingLive || (remainingRequests ?? 1) <= 0}
                className="border-[#1e3a5f] text-[#1e3a5f]"
              >
                {loadingLive ? <Loader2 className="h-4 w-4 animate-spin" /> : '🔍 Get Real Prices'}
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button
          onClick={onNext}
          disabled={!flightOptions}
          className="bg-[#ff6b6b] hover:bg-[#ff5252] text-white"
        >
          Find Accommodation →
        </Button>
      </div>
    </div>
  );
}
