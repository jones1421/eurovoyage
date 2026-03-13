import { NextRequest, NextResponse } from 'next/server';
import { generateItinerarySummary } from '@/lib/claude';
import type { TripItinerary, WizardState } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const state: WizardState = await req.json();
    const { preferences, selectedDestinations, flightOptions, selectedAccommodations } = state;

    if (!preferences || !selectedDestinations?.length) {
      return NextResponse.json({ error: 'Missing itinerary data' }, { status: 400 });
    }

    const month = new Date(2000, (preferences.travelMonth ?? 6) - 1, 1).toLocaleString('en', { month: 'long' });

    // Calculate cost estimates
    const flightCostEstimate =
      flightOptions?.estimates?.find((e) => e.origin === 'PHL')?.priceEstimate?.typical ??
      flightOptions?.estimates?.[0]?.priceEstimate?.typical ??
      1500;

    const accCost = selectedAccommodations.reduce((sum, a) => sum + (a.accommodation.totalPrice ?? 0), 0);
    const dailyEstimate = 150 * (preferences.durationDays ?? 10) * (preferences.numberOfTravelers ?? 1);
    const totalFlights = flightCostEstimate * (preferences.numberOfTravelers ?? 1);
    const totalCost = totalFlights + accCost + dailyEstimate;

    // Generate AI trip summary
    const destinationSummary = selectedDestinations.map((d) => ({
      city: d.cities[0]?.cityName ?? d.country,
      days: d.cities[0]?.daysRecommended ?? 3,
      attractions: d.cities[0]?.topAttractions ?? [],
    }));

    const summary = await generateItinerarySummary({
      destinations: destinationSummary,
      totalDays: preferences.durationDays ?? 10,
      month,
      tripStyle: preferences.tripStyle ?? ['culture'],
      totalEstimatedCost: totalCost,
    });

    // Build Google Flights links
    const googleFlightsLinks = flightOptions?.estimates?.map((e) => ({
      airport: e.origin,
      url: e.googleFlightsUrl,
    })) ?? [];

    const itinerary: TripItinerary = {
      id: Math.random().toString(36).slice(2),
      preferences: preferences as TripItinerary['preferences'],
      destinations: selectedDestinations,
      flights: {
        mainRoute: flightOptions!,
        googleFlightsLinks,
      },
      accommodations: selectedAccommodations.map((a) => ({
        cityName: a.cityName,
        checkIn: '',
        checkOut: '',
        accommodation: a.accommodation,
      })),
      totalEstimatedCost: {
        flights: totalFlights,
        accommodations: accCost,
        estimatedDaily: dailyEstimate,
        total: totalCost,
      },
      aiTripSummary: summary,
    };

    return NextResponse.json({ itinerary });
  } catch (err) {
    console.error('[/api/itinerary]', err);
    return NextResponse.json({ error: 'Failed to generate itinerary' }, { status: 500 });
  }
}
