export function buildGoogleFlightsUrl(params: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  cabinClass?: string;
}): string {
  const { origin, destination, departureDate, returnDate, adults = 1 } = params;
  const dateStr = returnDate
    ? `on ${departureDate} through ${returnDate}`
    : `on ${departureDate}`;
  const travelerStr = adults > 1 ? ` for ${adults} people` : '';
  const query = `Premium economy flights from ${origin} to ${destination} ${dateStr}${travelerStr}`;
  const url = new URL('https://www.google.com/travel/flights');
  url.searchParams.set('q', query);
  return url.toString();
}

export function buildMultiCityGoogleFlightsUrl(airports: string[], destination: string, dates: { departure: string; return?: string }): Record<string, string> {
  const links: Record<string, string> = {};
  for (const airport of airports) {
    links[airport] = buildGoogleFlightsUrl({
      origin: airport,
      destination,
      departureDate: dates.departure,
      returnDate: dates.return,
    });
  }
  return links;
}
