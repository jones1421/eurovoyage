import { NextRequest, NextResponse } from 'next/server';
import { getDestinationRecommendations } from '@/lib/claude';
import type { TripPreferences } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const prefs: Partial<TripPreferences> = await req.json();

    if (!prefs.travelMonth || !prefs.travelYear || !prefs.weatherPreference || !prefs.tripStyle) {
      return NextResponse.json({ error: 'Missing required preferences' }, { status: 400 });
    }

    const result = await getDestinationRecommendations({
      month: prefs.travelMonth,
      year: prefs.travelYear,
      weatherPreference: prefs.weatherPreference,
      tripStyle: prefs.tripStyle,
      durationDays: prefs.durationDays ?? 10,
      numberOfCities: prefs.numberOfCities ?? 2,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[/api/destinations]', err);
    return NextResponse.json({ error: 'Failed to fetch destinations' }, { status: 500 });
  }
}
