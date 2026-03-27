export function buildGoogleFlightsUrl(params: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  cabinClass?: string;
}): string {
  const { origin, destination, departureDate, returnDate, adults = 1 } = params;
  // Kayak deep-link: reliable URL format that actually pre-fills the search
  const base = `https://www.kayak.com/flights/${origin}-${destination}/${departureDate}`;
  const withReturn = returnDate ? `${base}/${returnDate}` : base;
  return `${withReturn}/${adults}adults?cabin=premiumeconomy`;
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
