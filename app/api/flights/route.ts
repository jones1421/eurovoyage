import { NextRequest, NextResponse } from 'next/server';
import { getFlightIntelligence } from '@/lib/claude';
import { searchFlights } from '@/lib/flights-api';
import { buildGoogleFlightsUrl } from '@/lib/google-flights';
import { getRemainingRequests, canMakeRequest } from '@/lib/request-budget';

// GET — returns Claude flight estimates (free)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      originAirports,
      destinationAirport,
      destinationCity,
      departureDate,
      returnDate,
      adults,
      maxBudgetPerPerson,
      mode, // 'estimate' | 'live'
    } = body;

    if (!originAirports || !destinationAirport || !departureDate) {
      return NextResponse.json({ error: 'Missing required flight params' }, { status: 400 });
    }

    const monthName = new Date(departureDate).toLocaleString('en', { month: 'long' });
    const year = new Date(departureDate).getFullYear();

    // Build Google Flights links for all airports (always free)
    const googleFlightsLinks = (originAirports as string[]).map((airport: string) => ({
      airport,
      url: buildGoogleFlightsUrl({
        origin: airport,
        destination: destinationAirport,
        departureDate,
        returnDate,
        adults: adults ?? 1,
      }),
    }));

    if (mode === 'live') {
      // Layer 2: Real flight data (burns API quota)
      if (!canMakeRequest()) {
        return NextResponse.json(
          { error: 'Monthly API limit reached (50/month). Please use the Google Flights links.', googleFlightsLinks },
          { status: 429 }
        );
      }

      const liveResults = await searchFlights({
        originSkyId: originAirports[0],
        destinationSkyId: destinationAirport,
        date: departureDate,
        returnDate,
        adults: adults ?? 1,
        cabinClass: 'premium_economy',
      });

      return NextResponse.json({
        liveResults,
        remainingRequests: getRemainingRequests(),
        googleFlightsLinks,
      });
    }

    // Layer 1: Claude estimates (free)
    const intelligence = await getFlightIntelligence({
      originAirports,
      destinationAirport,
      destinationCity,
      departureDate,
      returnDate,
      month: monthName,
      year,
      adults: adults ?? 1,
      maxBudgetPerPerson: maxBudgetPerPerson ?? 2500,
    });

    // Attach Google Flights URLs to each route estimate
    const routesWithLinks = (intelligence.routes ?? []).map((route: { origin: string; destination: string; [key: string]: unknown }) => ({
      ...route,
      googleFlightsUrl: buildGoogleFlightsUrl({
        origin: route.origin,
        destination: route.destination,
        departureDate,
        returnDate,
        adults: adults ?? 1,
      }),
    }));

    return NextResponse.json({
      routes: routesWithLinks,
      recommendation: intelligence.recommendation,
      budgetAssessment: intelligence.budgetAssessment,
      isWithinBudget: intelligence.isWithinBudget,
      googleFlightsLinks,
      remainingRequests: getRemainingRequests(),
    });
  } catch (err) {
    console.error('[/api/flights]', err);
    return NextResponse.json({ error: 'Failed to fetch flight data' }, { status: 500 });
  }
}
