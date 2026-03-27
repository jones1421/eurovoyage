import { NextRequest, NextResponse } from 'next/server';
import { searchHotels } from '@/lib/booking';
import { curateAccommodations } from '@/lib/claude';
import type { AccommodationResult } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      city,
      checkIn,
      checkOut,
      adults,
      maxPerNight,
      tripStyle,
      topAttractions,
      daysInCity,
    } = body;

    if (!city || !checkIn || !checkOut) {
      return NextResponse.json({ error: 'Missing required accommodation params' }, { status: 400 });
    }

    const monthName = new Date(checkIn).toLocaleString('en', { month: 'long' });

    let hotels: AccommodationResult[] = [];

    // Try Booking.com API
    if (process.env.RAPIDAPI_KEY) {
      try {
        const raw = await searchHotels({
          city,
          checkIn,
          checkOut,
          adults: adults ?? 1,
          maxPrice: maxPerNight,
          minScore: 7,
        });

        if (raw.length > 0) {
          // Send to Claude for curation
          const curated = await curateAccommodations({
            city,
            days: daysInCity ?? 3,
            month: monthName,
            tripStyle: tripStyle ?? ['culture'],
            maxPerNight: maxPerNight ?? 200,
            topAttractions: topAttractions ?? [],
            hotels: raw,
          });
          hotels = curated.accommodations ?? [];
        }
      } catch (bookingErr) {
        console.warn('[accommodations] Booking.com API failed, falling back to Claude-only', bookingErr);
      }
    }

    // Fallback: Claude-only accommodation recommendations
    if (hotels.length === 0) {
      const curated = await curateAccommodations({
        city,
        days: daysInCity ?? 3,
        month: monthName,
        tripStyle: tripStyle ?? ['culture'],
        maxPerNight: maxPerNight ?? 200,
        topAttractions: topAttractions ?? [],
        hotels: [], // Claude will generate from knowledge
      });
      hotels = curated.accommodations ?? [];
    }

    return NextResponse.json({ accommodations: hotels });
  } catch (err) {
    console.error('[/api/accommodations]', err);
    return NextResponse.json({ error: 'Failed to fetch accommodations' }, { status: 500 });
  }
}
