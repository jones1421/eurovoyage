import { getCacheKey, getCachedFlight, setCachedFlight } from './flight-cache';
import { trackRequest, canMakeRequest } from './request-budget';
import type { FlightLiveResult } from './types';

const FLIGHTS_API_HOST = 'flights-sky.p.rapidapi.com';

interface FlightSearchParams {
  originSkyId: string;
  destinationSkyId: string;
  originEntityId?: string;
  destinationEntityId?: string;
  date: string;           // 'YYYY-MM-DD'
  returnDate?: string;    // 'YYYY-MM-DD'
  adults: number;
  cabinClass?: string;
  currency?: string;
  market?: string;
  locale?: string;
}

export async function searchFlights(params: FlightSearchParams): Promise<FlightLiveResult[]> {
  if (!process.env.RAPIDAPI_KEY) throw new Error('RAPIDAPI_KEY not configured');

  const cacheKey = getCacheKey(
    params.originSkyId,
    params.destinationSkyId,
    params.date,
    params.returnDate ?? ''
  );

  const cached = getCachedFlight(cacheKey);
  if (cached) return cached;

  if (!canMakeRequest()) {
    throw new Error('Monthly API request limit (50) reached. Use Google Flights links instead.');
  }

  const queryParams = new URLSearchParams({
    originSkyId: params.originSkyId,
    destinationSkyId: params.destinationSkyId,
    date: params.date,
    adults: String(params.adults),
    cabinClass: params.cabinClass ?? 'premium_economy',
    currency: params.currency ?? 'USD',
    market: params.market ?? 'US',
    locale: params.locale ?? 'en-US',
  });

  if (params.returnDate) queryParams.set('returnDate', params.returnDate);
  if (params.originEntityId) queryParams.set('originEntityId', params.originEntityId);
  if (params.destinationEntityId) queryParams.set('destinationEntityId', params.destinationEntityId);

  const response = await fetch(
    `https://${FLIGHTS_API_HOST}/flights/search-roundtrip?${queryParams.toString()}`,
    {
      headers: {
        'x-rapidapi-host': FLIGHTS_API_HOST,
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      },
    }
  );

  if (!response.ok) throw new Error(`Flight API error: ${response.status}`);

  trackRequest();
  const raw = await response.json();
  const results = parseFlightResults(raw, params.originSkyId, params.destinationSkyId);
  setCachedFlight(cacheKey, results);
  return results;
}

function parseFlightResults(raw: unknown, origin: string, destination: string): FlightLiveResult[] {
  if (!raw || typeof raw !== 'object') return [];
  const data = raw as Record<string, unknown>;
  const itineraries = (data.data as Record<string, unknown>)?.itineraries as unknown[];
  if (!Array.isArray(itineraries)) return [];

  return itineraries.slice(0, 5).map((it: unknown) => {
    const item = it as Record<string, unknown>;
    const price = (item.price as Record<string, unknown>)?.raw as number ?? 0;
    const legs = item.legs as Record<string, unknown>[];
    const firstLeg = legs?.[0] ?? {};
    const carrier = ((firstLeg.carriers as Record<string, unknown>)?.marketing as Record<string, unknown>[])?.[0];

    return {
      origin,
      destination,
      price,
      airline: (carrier?.name as string) ?? 'Unknown',
      flightNumbers: [],
      departureTime: (firstLeg.departure as string) ?? '',
      arrivalTime: (firstLeg.arrival as string) ?? '',
      duration: String(firstLeg.durationInMinutes ?? 0),
      stops: (firstLeg.stopCount as number) ?? 0,
      bookingUrl: '',
      lastChecked: new Date().toISOString(),
      source: 'live' as const,
    };
  });
}

export async function searchLocations(query: string) {
  if (!process.env.RAPIDAPI_KEY) throw new Error('RAPIDAPI_KEY not configured');
  const response = await fetch(
    `https://${FLIGHTS_API_HOST}/flights/auto-complete?query=${encodeURIComponent(query)}`,
    {
      headers: {
        'x-rapidapi-host': FLIGHTS_API_HOST,
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      },
    }
  );
  return response.json();
}
