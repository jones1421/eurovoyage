import type { FlightLiveResult } from './types';

interface CacheEntry {
  data: FlightLiveResult[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function getCacheKey(origin: string, dest: string, date: string, returnDate: string): string {
  return `${origin.toUpperCase()}-${dest.toUpperCase()}-${date}-${returnDate}`;
}

export function getCachedFlight(key: string): FlightLiveResult[] | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data;
  cache.delete(key);
  return null;
}

export function setCachedFlight(key: string, data: FlightLiveResult[]): void {
  cache.set(key, { data, timestamp: Date.now() });
}
