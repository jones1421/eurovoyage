import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-20250514';

// ─── Destination Recommendations ──────────────────────────────────────────────

export async function getDestinationRecommendations(prefs: {
  month: number;
  year: number;
  weatherPreference: string;
  tripStyle: string[];
  durationDays: number;
  numberOfCities: number;
}) {
  const monthName = new Date(2000, prefs.month - 1, 1).toLocaleString('en', { month: 'long' });

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are a European travel expert. Given these preferences:
- Month: ${monthName} ${prefs.year}
- Weather preference: ${prefs.weatherPreference}
- Trip style: ${prefs.tripStyle.join(', ')}
- Duration: ${prefs.durationDays} days
- Number of cities: ${prefs.numberOfCities}

Recommend 4-5 European destinations. For each, provide:
- Country name and ISO 2-letter country code (countryCode field)
- Specific cities to visit with IATA airport codes
- Average temperature for that month in Fahrenheit
- Why it's a good fit (2-3 sentences in the "reasoning" field)
- Seasonal highlights (festivals, events, shoulder season benefits)
- Best neighborhoods to stay in each city
- Suggested days per city (should add up to ${prefs.durationDays} for ${prefs.numberOfCities} cities)
- Top 3-4 attractions per city
- Why visit each city (1 sentence in "whyVisit")

Return ONLY valid JSON (no markdown, no code fences) matching this exact schema:
{
  "destinations": [
    {
      "country": "Spain",
      "countryCode": "ES",
      "reasoning": "...",
      "avgTemperatureF": 72,
      "weatherDescription": "Sunny and warm",
      "seasonalHighlights": ["..."],
      "cities": [
        {
          "cityName": "Barcelona",
          "iataCode": "BCN",
          "daysRecommended": 4,
          "topAttractions": ["Sagrada Familia", "Park Güell"],
          "neighborhoods": ["Eixample", "El Born"],
          "whyVisit": "..."
        }
      ]
    }
  ]
}`,
      },
    ],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  return JSON.parse(text);
}

// ─── Flight Intelligence (Layer 1 — free exploration) ─────────────────────────

export async function getFlightIntelligence(params: {
  originAirports: string[];
  destinationAirport: string;
  destinationCity: string;
  departureDate: string;
  returnDate: string;
  month: string;
  year: number;
  adults: number;
  maxBudgetPerPerson: number;
}) {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `You are a flight pricing expert for US-to-Europe routes.
Route: ${params.originAirports.join(', ')} → ${params.destinationAirport} (${params.destinationCity})
Travel dates: ${params.departureDate} to ${params.returnDate} (${params.month} ${params.year})
Cabin: Premium Economy
Travelers: ${params.adults}
Budget: $${params.maxBudgetPerPerson}/person

Provide for each departure airport (${params.originAirports.join(', ')}):
1. Whether nonstop flights typically exist on this route
2. Which airlines typically fly this route in premium economy
3. Estimated price range per person (low / typical / high) in USD
4. Whether this is a good deal month or expensive month for this route
5. Any tips specific to that airport-destination pairing

Return ONLY valid JSON (no markdown, no code fences):
{
  "routes": [
    {
      "origin": "PHL",
      "destination": "${params.destinationAirport}",
      "nonstopAvailable": false,
      "airlines": ["American Airlines (via CLT)", "United (via EWR)"],
      "priceEstimate": { "low": 1200, "typical": 1800, "high": 2400 },
      "isGoodDealMonth": true,
      "tips": "...",
      "source": "estimate"
    }
  ],
  "recommendation": "Best value is JFK on Iberia nonstop for ~$1,600",
  "budgetAssessment": "Under $${params.maxBudgetPerPerson} budget is achievable",
  "isWithinBudget": true
}`,
      },
    ],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  return JSON.parse(text);
}

// ─── Accommodation Curation ────────────────────────────────────────────────────

export async function curateAccommodations(params: {
  city: string;
  days: number;
  month: string;
  tripStyle: string[];
  maxPerNight: number;
  topAttractions: string[];
  hotels: unknown[];
}) {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    messages: [
      {
        role: 'user',
        content: `You are a European travel accommodation expert.
The traveler is visiting ${params.city} for ${params.days} days in ${params.month}.
Trip style: ${params.tripStyle.join(', ')}. Budget: $${params.maxPerNight}/night.
Top attractions they care about: ${params.topAttractions.join(', ')}

Here are accommodation options from Booking.com:
${JSON.stringify(params.hotels, null, 2)}

Rank the top 3-5 best options considering:
- Location relative to the top attractions
- Neighborhood walkability and tourist safety
- Value for the price
- Guest review quality
- Whether it suits a ${params.tripStyle.join('/')} traveler

Return ONLY valid JSON (no markdown):
{
  "accommodations": [
    {
      "name": "...",
      "type": "hotel",
      "pricePerNight": 150,
      "totalPrice": 600,
      "rating": 8.5,
      "reviewCount": 1200,
      "neighborhood": "Eixample",
      "distanceToCenter": "0.5 miles",
      "amenities": ["WiFi", "Breakfast"],
      "photoUrl": "...",
      "bookingUrl": "...",
      "aiNotes": "Perfect for culture travelers — steps from Passeig de Gràcia",
      "nearbyAttractions": ["Sagrada Familia", "Casa Batlló"]
    }
  ]
}`,
      },
    ],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  return JSON.parse(text);
}

// ─── Itinerary Generation ──────────────────────────────────────────────────────

export async function generateItinerarySummary(params: {
  destinations: Array<{ city: string; days: number; attractions: string[] }>;
  totalDays: number;
  month: string;
  tripStyle: string[];
  totalEstimatedCost: number;
}) {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `You are a European travel expert. Write an enthusiastic, personal 3-4 sentence trip summary for this itinerary:

Trip: ${params.totalDays} days in ${params.month}
Style: ${params.tripStyle.join(', ')}
Cities: ${params.destinations.map((d) => `${d.city} (${d.days} days)`).join(' → ')}
Key highlights: ${params.destinations.flatMap((d) => d.attractions.slice(0, 2)).join(', ')}
Estimated total cost: $${params.totalEstimatedCost.toLocaleString()}

Write the summary as if speaking directly to the traveler. Be specific about what makes this trip special. Do not use markdown — plain text only.`,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}
