const BOOKING_API_HOST = 'booking-com.p.rapidapi.com';

export interface BookingHotelRaw {
  hotel_id: number;
  hotel_name: string;
  accommodation_type_name: string;
  review_score: number;
  review_nr: number;
  neighbourhood_cleaned: string;
  distance_to_cc: string;
  price_breakdown?: {
    all_inclusive_price?: number;
    gross_price?: number;
  };
  url: string;
  main_photo_url?: string;
  facilities?: string[];
  latitude?: number;
  longitude?: number;
}

export async function searchHotels(params: {
  city: string;
  checkIn: string;   // 'YYYY-MM-DD'
  checkOut: string;  // 'YYYY-MM-DD'
  adults: number;
  maxPrice?: number;
  minScore?: number;
}): Promise<BookingHotelRaw[]> {
  if (!process.env.RAPIDAPI_KEY) throw new Error('RAPIDAPI_KEY not configured');

  const { city, checkIn, checkOut, adults, maxPrice, minScore = 7 } = params;

  const queryParams = new URLSearchParams({
    location_name: city,
    checkin_date: checkIn,
    checkout_date: checkOut,
    adults_number: String(adults),
    room_number: '1',
    order_by: 'popularity',
    filter_by_currency: 'USD',
    locale: 'en-gb',
    units: 'imperial',
    include_adjacency: 'true',
  });

  if (maxPrice) queryParams.set('price_filter_currencycode', 'USD');

  const response = await fetch(
    `https://${BOOKING_API_HOST}/v1/hotels/search?${queryParams.toString()}`,
    {
      headers: {
        'x-rapidapi-host': BOOKING_API_HOST,
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      },
    }
  );

  if (!response.ok) throw new Error(`Booking.com API error: ${response.status}`);

  const data = await response.json();
  const results: BookingHotelRaw[] = data.result ?? [];
  return results.filter((h) => h.review_score >= minScore).slice(0, 15);
}
