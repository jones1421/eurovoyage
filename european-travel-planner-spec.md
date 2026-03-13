# EuroVoyage — European Travel Planner

## Project Overview

A web application that helps plan European trips by recommending destinations based on season, weather preferences, and budget — then finding real premium economy flights from Philadelphia (PHL) or NYC-area airports (JFK, EWR, LGA), and surfacing quality accommodations near attractions. The user picks a travel month, states preferences (warm/cold, culture/beach/adventure), and the app intelligently narrows destinations, checks real flight pricing, and helps build a multi-city itinerary with lodging.

**Primary user**: Solo traveler or couple planning 1-3 week European trips from the US East Coast.

---

## Tech Stack (Recommended)

**Next.js 14+ (App Router)** — single codebase for frontend + API routes, ideal for this project's scope.

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 14+ (App Router) | React frontend + serverless API routes in one project |
| Styling | Tailwind CSS + shadcn/ui | Fast, polished UI without custom CSS overhead |
| State | React Context + useState | Simple enough; no Redux needed |
| Flight Search | Flights Scraper Sky (RapidAPI) + Claude AI | Real-time pricing for selected routes; Claude AI for exploration/estimates |
| Accommodation API | Booking.com via RapidAPI (Api Dojo) | Real listings, pricing, ratings, photos |
| AI Recommendations | Anthropic Claude API (claude-sonnet-4-20250514) | Destination intelligence, accommodation curation, trip advice |
| Database (optional v2) | Supabase (Postgres) | Save trips, user preferences — add later |
| Deployment | Vercel | Zero-config for Next.js, free tier works |

---

## API Setup Instructions

### 1. Flights Scraper Sky via RapidAPI (Real-Time Flight Pricing)

- **Provider**: Things4u (ntd119) on RapidAPI
- **What it does**: Scrapes Skyscanner + Google Flights, returns real-time structured JSON with prices, airlines, stops, durations
- **Free tier**: 50 requests/month (hard limit), 1,000 requests/hour rate limit
- **API host**: `flights-sky.p.rapidapi.com`
- **Strategy**: Use sparingly — Claude AI handles exploration/estimates (free), real API only when user commits to a specific route
- **MCP support**: Available for Claude Code development (see MCP config below)

### 2. Booking.com via RapidAPI (Accommodations)

- **Provider**: Api Dojo on RapidAPI — the most established Booking API (9.9 rating, 2+ years)
- Sign up: https://rapidapi.com/apidojo/api/booking-com
- **Free tier**: 500 requests/month (hard limit), 5 requests/second rate limit
- Same RapidAPI key as Flights Scraper Sky — one key, both APIs
- Key endpoints:
  - `GET /v1/hotels/search` — search by destination, dates, guests
  - `GET /v1/hotels/data` — hotel details, photos, amenities
  - `GET /v1/hotels/reviews` — guest reviews

### 3. Anthropic Claude API (AI Intelligence Layer)

- Sign up: https://console.anthropic.com/
- Create API key
- Model: `claude-sonnet-4-20250514`
- Used for: destination recommendations, flight price estimation (exploration phase), accommodation curation, itinerary generation

### Environment Variables (.env.local)

```bash
# RapidAPI (single key works for BOTH Flights Scraper Sky + Booking.com)
RAPIDAPI_KEY=your_rapidapi_key

# Anthropic Claude
ANTHROPIC_API_KEY=your_anthropic_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### MCP Configuration (for Claude Code development)

Add this to your Claude Code MCP config to let Claude Code call the flight API directly during development:

```json
{
  "mcpServers": {
    "RapidAPI Hub - Flights Scraper Sky": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mcp.rapidapi.com",
        "--header",
        "x-api-host: flights-sky.p.rapidapi.com",
        "--header",
        "x-api-key: YOUR_RAPIDAPI_KEY"
      ]
    }
  }
}
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     NEXT.JS APP                          │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │              FRONTEND (React)                      │  │
│  │                                                    │  │
│  │  [Month/Pref Selector] → [Destination Cards]       │  │
│  │  [Flight Results]      → [Accommodation Picks]     │  │
│  │  [Multi-City Builder]  → [Trip Summary]            │  │
│  └────────────────────────────────────────────────────┘  │
│                          │                               │
│  ┌────────────────────────────────────────────────────┐  │
│  │            API ROUTES (/api/*)                      │  │
│  │                                                    │  │
│  │  /api/destinations    → Claude AI + static data    │  │
│  │  /api/flights         → Claude AI + Google Flights URL builder │  │
│  │  /api/accommodations  → Booking.com + Claude AI    │  │
│  │  /api/itinerary       → Claude AI orchestration    │  │
│  └────────────────────────────────────────────────────┘  │
│                          │                               │
│  ┌───────────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Google Flights │  │ Booking  │  │  Claude API      │  │
│  │ (deep links)  │  │ (hotels) │  │  (intelligence)  │  │
│  └───────────────┘  └──────────┘  └──────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## Data Models

### TripPreferences (user input)

```typescript
interface TripPreferences {
  travelMonth: number;               // 1-12
  travelYear: number;                // e.g. 2026
  durationDays: number;              // total trip length
  weatherPreference: 'warm' | 'mild' | 'cold' | 'any';
  tripStyle: ('culture' | 'beach' | 'adventure' | 'food' | 'nightlife' | 'history')[];
  numberOfCities: number;            // 1-5
  numberOfTravelers: number;         // 1-4
  departureAirports: string[];       // ['PHL', 'JFK', 'EWR'] — PHL preferred
  maxFlightBudgetPerPerson: number;  // default 2500
  cabinClass: 'PREMIUM_ECONOMY';     // locked to premium economy
  preferNonstop: boolean;            // default true
  accommodationType: 'hotel' | 'apartment' | 'any';
  maxAccommodationPerNight: number;  // budget per night in USD
}
```

### DestinationRecommendation (from Claude AI)

```typescript
interface DestinationRecommendation {
  country: string;
  cities: CityRecommendation[];
  reasoning: string;              // why this destination fits
  avgTemperatureF: number;        // expected temp for that month
  weatherDescription: string;
  seasonalHighlights: string[];   // festivals, events, shoulder season perks
}

interface CityRecommendation {
  cityName: string;
  iataCode: string;               // nearest airport
  daysRecommended: number;        // suggested time to spend
  topAttractions: string[];
  neighborhoods: string[];        // best areas to stay
  whyVisit: string;
}
```

### FlightData (Hybrid: Claude estimates + real API results)

```typescript
// Layer 1: Flight intelligence from Claude AI (free, instant estimates)
interface FlightEstimate {
  origin: string;                   // 'PHL'
  destination: string;              // 'MAD'
  nonstopAvailable: boolean;
  airlines: string[];               // airlines that fly this route
  priceEstimate: {
    low: number;                    // best case $/person
    typical: number;                // average $/person
    high: number;                   // peak $/person
  };
  isGoodDealMonth: boolean;
  tips: string;                     // Claude's route-specific advice
  googleFlightsUrl: string;         // pre-filled Google Flights link (always available)
  source: 'estimate';              // indicates this is a Claude estimate
}

// Layer 2: Real flight data from Flights Scraper Sky API (50/month)
interface FlightLiveResult {
  origin: string;
  destination: string;
  price: number;                    // actual price in USD
  airline: string;
  flightNumbers: string[];
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  bookingUrl: string;               // deep link to booking
  lastChecked: string;              // ISO timestamp
  source: 'live';                   // indicates this is real API data
}

// Combined flight options for a destination
interface FlightOptions {
  destination: string;
  destinationCity: string;
  estimates: FlightEstimate[];        // Claude AI layer (always present)
  liveResults?: FlightLiveResult[];   // Real API layer (present after user clicks "Get Real Prices")
  recommendation: string;
  budgetAssessment: string;
  isWithinBudget: boolean;
}
```

### AccommodationResult (from Booking.com + Claude curation)

```typescript
interface AccommodationResult {
  name: string;
  type: 'hotel' | 'apartment' | 'guesthouse';
  pricePerNight: number;          // USD
  totalPrice: number;
  rating: number;                 // out of 10
  reviewCount: number;
  neighborhood: string;
  distanceToCenter: string;
  amenities: string[];
  photoUrl: string;
  bookingUrl: string;
  aiNotes: string;                // Claude's recommendation note
  nearbyAttractions: string[];
}
```

### TripItinerary (final output)

```typescript
interface TripItinerary {
  id: string;
  preferences: TripPreferences;
  destinations: DestinationRecommendation[];
  flights: {
    mainRoute: FlightOptions;        // outbound/return to first city
    interCity?: FlightOptions[];     // flights between cities if needed
    googleFlightsLinks: {            // pre-built links per airport
      airport: string;
      url: string;
    }[];
  };
  accommodations: {
    cityName: string;
    checkIn: string;
    checkOut: string;
    accommodation: AccommodationResult;
  }[];
  totalEstimatedCost: {
    flights: number;
    accommodations: number;
    estimatedDaily: number;       // food, transport, activities estimate
    total: number;
  };
  aiTripSummary: string;          // Claude-generated trip overview
}
```

---

## Feature Specifications

### Phase 1: Smart Destination Picker (Priority 1)

**Flow:**
1. User selects travel month + weather preference + trip style
2. App calls `/api/destinations` which sends preferences to Claude API
3. Claude returns 3-5 country/city recommendations with reasoning
4. User sees destination cards with: country flag, temperature, highlights, estimated flight price range
5. User selects a destination and number of cities

**Claude Prompt Strategy:**
```
You are a European travel expert. Given these preferences:
- Month: {month}
- Weather: {weatherPreference}
- Style: {tripStyle}
- Duration: {durationDays} days
- Number of cities: {numberOfCities}

Recommend 3-5 European destinations. For each, provide:
- Country and specific cities to visit
- IATA airport codes for each city
- Average temperature for that month
- Why it's a good fit (2-3 sentences)
- Seasonal highlights (festivals, events, shoulder season benefits)
- Best neighborhoods to stay in each city
- Suggested days per city

Respond in JSON format matching the DestinationRecommendation schema.
```

**Built-in Destination Knowledge Base (supplement Claude):**
Include a static JSON file with European destination metadata to reduce API calls and provide instant filtering:

```typescript
// data/european-destinations.json (partial example)
{
  "spain": {
    "climate_zones": { "south": "mediterranean", "north": "oceanic" },
    "best_months_warm": [10, 11, 12, 3, 4, 5],
    "cities": {
      "madrid": { "iata": "MAD", "type": ["culture", "food", "nightlife"] },
      "barcelona": { "iata": "BCN", "type": ["culture", "beach", "food"] },
      "seville": { "iata": "SVQ", "type": ["culture", "history", "food"] },
      "malaga": { "iata": "AGP", "type": ["beach", "culture"] }
    }
  },
  "malta": {
    "climate_zones": { "all": "mediterranean" },
    "best_months_warm": [10, 11, 12, 3, 4, 5],
    "cities": {
      "valletta": { "iata": "MLA", "type": ["history", "culture", "beach"] }
    }
  }
  // ... 25-30 European countries
}
```

### Phase 2: Flight Search (Priority 2)

**Architecture: Two-Layer Hybrid (Claude AI + Flights Scraper Sky API)**

The free tier of Flights Scraper Sky gives 50 requests/month. A single trip planning session
searching 3 airports × 1 destination = 3 API calls. So ~16 route searches per month.
Strategy: Claude AI handles the exploration phase (free, unlimited), real API fires only
when the user commits to a specific route and wants real pricing.

**Flow:**
1. User selects destination(s) from Phase 1
2. **Layer 1 — Claude AI (free, instant)**: Estimates price ranges, nonstop availability, airline info for all airports. User sees "estimated" prices immediately.
3. User picks which routes interest them → clicks "Get Real Prices"
4. **Layer 2 — Flights Scraper Sky API (real data, costs 1 request each)**: Fetches actual current pricing from Skyscanner/Google Flights. Replaces estimates with real prices.
5. Results cached for 24 hours to avoid burning requests on repeat searches.
6. Google Flights deep links always available as fallback/complement.

**Why This Hybrid Works:**
- Claude estimates are free and instant — great for browsing 5-10 destination options
- Real API calls only fire when user narrows to 1-2 routes they care about
- 50 requests/month supports ~5-6 full trip planning sessions (personal use)
- Cache prevents wasting calls on the same search
- Google Flights links remain as a free fallback for any route

**Flights Scraper Sky API Client:**
```typescript
// lib/flights-api.ts

const FLIGHTS_API_HOST = 'flights-sky.p.rapidapi.com';

interface FlightSearchParams {
  originSkyId: string;          // Airport sky ID (e.g., 'PHL', 'NYCA' for all NYC)
  destinationSkyId: string;     // Destination sky ID
  originEntityId?: string;      // Entity ID from location search
  destinationEntityId?: string;
  date: string;                 // 'YYYY-MM-DD'
  returnDate?: string;          // 'YYYY-MM-DD'
  adults: number;
  cabinClass?: string;          // 'economy', 'premium_economy', 'business', 'first'
  currency?: string;            // 'USD'
  market?: string;              // 'US'
  locale?: string;              // 'en-US'
}

async function searchFlights(params: FlightSearchParams) {
  const response = await fetch(
    `https://${FLIGHTS_API_HOST}/flights/search-roundtrip`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-host': FLIGHTS_API_HOST,
        'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
      },
      // Pass params as query string
    }
  );
  return response.json();
}

// Location search — needed to get skyId and entityId for airports/cities
async function searchLocations(query: string) {
  const response = await fetch(
    `https://${FLIGHTS_API_HOST}/flights/auto-complete?query=${encodeURIComponent(query)}`,
    {
      headers: {
        'x-rapidapi-host': FLIGHTS_API_HOST,
        'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
      },
    }
  );
  return response.json();
}
```

**Caching Strategy (critical with 50 req/month):**
```typescript
// lib/flight-cache.ts

// Simple in-memory cache (upgrade to Redis/Supabase in v2)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(origin: string, dest: string, date: string, returnDate: string): string {
  return `${origin}-${dest}-${date}-${returnDate}`;
}

function getCachedFlight(key: string) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data;
  cache.delete(key);
  return null;
}

function setCachedFlight(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}
```

**Request Budget Tracker:**
```typescript
// lib/request-budget.ts
// Track API usage to warn users before hitting the 50/month limit

let monthlyRequestCount = 0;
let currentMonth = new Date().getMonth();

function trackRequest() {
  const now = new Date().getMonth();
  if (now !== currentMonth) { monthlyRequestCount = 0; currentMonth = now; }
  monthlyRequestCount++;
}

function getRemainingRequests(): number { return 50 - monthlyRequestCount; }
function canMakeRequest(): boolean { return monthlyRequestCount < 50; }
```

**Claude Flight Intelligence Prompt (Layer 1 — free exploration):**
```
You are a flight pricing expert for US-to-Europe routes.
Given this route: {originAirports} → {destinationAirport} ({destinationCity})
Travel dates: {departureDate} to {returnDate} ({month}, {year})
Cabin: Premium Economy
Travelers: {adults}

Provide for each departure airport (PHL, JFK, EWR):
1. Whether nonstop flights typically exist on this route
2. Which airlines typically fly this route in premium economy
3. Estimated price range per person (low / typical / high)
4. Whether this is a good deal month or expensive month for this route
5. Any tips (e.g., "JFK has more nonstop options than PHL for Madrid")

Respond in JSON matching this schema:
{
  "routes": [
    {
      "origin": "PHL",
      "destination": "MAD",
      "nonstopAvailable": false,
      "airlines": ["American Airlines (via CLT/DFW)", "United (via EWR)"],
      "priceEstimate": { "low": 1200, "typical": 1800, "high": 2400 },
      "isGoodDealMonth": true,
      "tips": "No nonstop from PHL to MAD; consider JFK for nonstop on Iberia"
    }
  ],
  "recommendation": "Best value is likely JFK on Iberia nonstop for ~$1,600",
  "budgetAssessment": "Under $2,500 budget is very achievable for December"
}
```

**Google Flights URL Builder (free fallback — always available):**
```typescript
// lib/google-flights.ts

function buildGoogleFlightsUrl(params: {
  origin: string;        // 'PHL'
  destination: string;   // 'MAD'
  departureDate: string; // '2026-12-05'
  returnDate?: string;
}): string {
  const dateStr = params.returnDate
    ? `on ${params.departureDate} through ${params.returnDate}`
    : `on ${params.departureDate}`;
  const query = `Flights from ${params.origin} to ${params.destination} ${dateStr}`;
  const url = new URL('https://www.google.com/travel/flights');
  url.searchParams.set('q', query);
  return url.toString();
}
```

**Flight Results UI — Two States:**

*State 1: "Estimated" (Claude AI — shown immediately)*
- Price estimate badge with "~" prefix (e.g., "~$1,800")
- "Estimated" label in muted text
- Nonstop indicator per airport
- Airline names
- "Get Real Prices" button → triggers API call (shows remaining request count)
- "View on Google Flights" link (always available, opens new tab)

*State 2: "Live" (after API call — replaces estimates)*
- Actual price (e.g., "$1,647")
- "Live Price" badge in green
- Specific flight options with times, airlines, stops
- Direct booking links from Skyscanner
- "Last checked: 2 hours ago" timestamp
- Google Flights link still available

**Budget Logic:**
- Color coding: green (<$1,500), yellow ($1,500-2,200), red ($2,200-2,500), gray (>$2,500)
- Works for both estimated and live prices
- If over budget → suggest alternate dates, airports, or destinations
- Show remaining API requests: "12 of 50 searches used this month"

### Phase 3: Accommodation Search (Priority 3)

**Hybrid Approach — Real API + Claude Curation:**

1. **Booking.com API** fetches real listings for each city + dates
2. **Claude API** curates and ranks results based on:
   - Proximity to attractions the user cares about
   - Neighborhood quality/safety for tourists
   - Value for money assessment
   - Personal recommendation note

**Flow:**
1. For each city in the itinerary, search Booking.com API
2. Filter by: budget, rating (8.0+), type preference
3. Send top 10 results to Claude with city context
4. Claude returns ranked top 3-5 with personalized notes
5. User sees curated picks with Claude's reasoning

**Claude Curation Prompt:**
```
You are a European travel accommodation expert. 
The traveler is visiting {city} for {days} days in {month}.
Their style: {tripStyle}. Budget: ${maxPerNight}/night.

Here are {count} accommodation options from Booking.com:
{JSON array of Booking.com results}

Rank the top 3-5 best options considering:
- Location relative to {topAttractions}
- Neighborhood walkability and safety
- Value for the price
- Guest review quality (not just score)
- Whether it suits a {tripStyle} traveler

For each pick, add a 1-2 sentence personal recommendation note
explaining why this is a great choice.

Respond in JSON matching the AccommodationResult schema.
```

### Phase 4: Multi-City Itinerary Builder (Priority 4)

**Flow:**
1. After flights + accommodations selected for all cities
2. Claude generates a day-by-day suggested itinerary
3. Includes: inter-city transport recommendations (train vs budget flight)
4. Calculates total trip cost estimate
5. Generates shareable trip summary

**Inter-city Transport Logic:**
- If cities are < 3 hours apart by train → recommend train (include approx cost)
- If cities are > 3 hours apart → check for budget flights via Amadeus
- Claude provides context on best transport options per route

---

## UI/UX Design Direction

### Layout: Step-by-step wizard with persistent sidebar summary

```
┌─────────────────────────────────────────────────────────┐
│  🌍 EuroVoyage                              [My Trips]  │
├──────────────────────────┬──────────────────────────────┤
│                          │                              │
│   MAIN CONTENT AREA      │   TRIP SUMMARY SIDEBAR       │
│                          │                              │
│   Step 1: Preferences    │   Month: December 2026       │
│   Step 2: Destinations   │   Style: Warm, Culture       │
│   Step 3: Flights        │   Budget: $2,500/ticket      │
│   Step 4: Accommodations │   Cities: 3                  │
│   Step 5: Review         │   ─────────────────────      │
│                          │   Est. Total: $X,XXX         │
│                          │                              │
└──────────────────────────┴──────────────────────────────┘
```

### Design Tokens:
- **Primary color**: Deep blue (#1e3a5f) — trustworthy, travel
- **Accent**: Warm coral (#ff6b6b) — energy, warmth
- **Background**: Soft off-white (#f8f9fa)
- **Cards**: White with subtle shadow, rounded corners
- **Typography**: Inter or system fonts
- **Icons**: Lucide React icon set

### Key UI Components:
1. **MonthPicker** — visual calendar strip, click a month
2. **PreferenceSelector** — pill-style multi-select for trip styles
3. **DestinationCard** — country flag, temp badge, highlights, "Select" CTA
4. **FlightResultCard** — airline logo, route, price badge (color-coded), nonstop badge
5. **AccommodationCard** — photo, rating, price, Claude's recommendation note
6. **TripCostBreakdown** — visual bar chart of cost categories
7. **ItineraryStepper** — progress indicator across the wizard steps

---

## Project Structure

```
eurovoyage/
├── app/
│   ├── layout.tsx                  # Root layout with nav
│   ├── page.tsx                    # Landing / start planning
│   ├── plan/
│   │   ├── page.tsx                # Main wizard page
│   │   └── layout.tsx              # Wizard layout with sidebar
│   ├── api/
│   │   ├── destinations/
│   │   │   └── route.ts            # Claude AI destination recommendations
│   │   ├── flights/
│   │   │   └── route.ts            # Amadeus flight search
│   │   ├── accommodations/
│   │   │   └── route.ts            # Booking.com + Claude curation
│   │   └── itinerary/
│   │       └── route.ts            # Claude AI itinerary generation
│   └── globals.css
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── wizard/
│   │   ├── StepPreferences.tsx
│   │   ├── StepDestinations.tsx
│   │   ├── StepFlights.tsx
│   │   ├── StepAccommodations.tsx
│   │   └── StepReview.tsx
│   ├── DestinationCard.tsx
│   ├── FlightResultCard.tsx
│   ├── AccommodationCard.tsx
│   ├── TripSidebar.tsx
│   ├── MonthPicker.tsx
│   └── CostBreakdown.tsx
├── lib/
│   ├── flights-api.ts              # Flights Scraper Sky API client
│   ├── flight-cache.ts             # 24-hour flight result cache
│   ├── request-budget.ts           # API request budget tracker (50/month)
│   ├── google-flights.ts           # Google Flights URL builder (free fallback)
│   ├── booking.ts                  # Booking.com API client
│   ├── claude.ts                   # Anthropic API client
│   └── types.ts                    # All TypeScript interfaces
├── data/
│   └── european-destinations.json  # Static destination metadata
├── .env.local                      # API keys (not committed)
├── .env.example                    # Template for API keys
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Claude Code Setup Instructions

### Step 1: Initialize Project
```bash
npx create-next-app@latest eurovoyage --typescript --tailwind --eslint --app --src=no
cd eurovoyage
```

### Step 2: Install Dependencies
```bash
npm install @anthropic-ai/sdk lucide-react recharts
npx shadcn@latest init
npx shadcn@latest add button card input select badge tabs progress separator sheet
```

### Step 3: Create .env.example
Copy the environment variables template from the "Environment Variables" section above.

### Step 4: Build Order
Follow feature priority:
1. **Scaffold**: Project structure, types, layout, wizard shell
2. **Phase 1**: Destination picker (Claude API integration + static data)
3. **Phase 2**: Flight search (Claude AI estimates + Flights Scraper Sky API for real pricing)
4. **Phase 3**: Accommodation search (Booking.com + Claude curation)
5. **Phase 4**: Itinerary builder + cost summary

### Step 5: Dev Commands
```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
npm run lint         # Lint check
```

---

## API Rate Limiting & Cost Notes

| API | Free Tier | Rate Limit | Est. Cost Beyond Free |
|---|---|---|---|
| Flights Scraper Sky (RapidAPI) | 50 requests/month | 1,000 req/hour | Pro: $15/mo (20K req) |
| Booking.com Api Dojo (RapidAPI) | 500 requests/month | 5 req/second | Pro: $20/mo (10K req) |
| Claude API (Sonnet) | Pay per use | Standard limits | ~$0.01-0.05 per recommendation call |
| Google Flights links | Unlimited (URL generation) | N/A | Free forever |

**Cost optimization tips:**
- Cache destination + flight intelligence results (same month + prefs = same Claude response)
- Google Flights links are free and unlimited — no caching needed
- Batch accommodation curation (send all results in one Claude call per city)
- Use the static destination JSON to pre-filter before hitting Claude

---

## Error Handling Strategy

- **Claude flight estimates uncertain**: Show range with disclaimer + Google Flights link for real prices
- **Over budget estimate**: Suggest alternate months, destinations, or economy class as fallback
- **Booking.com API down**: Fall back to Claude-only accommodation recommendations with Booking.com search links
- **Claude API down**: Use static destination data + generate Google Flights links without AI enrichment
- **Rate limited**: Queue requests with exponential backoff, show loading states

---

## Future Enhancements (v2+)

- **Upgrade to Pro flight tier** — $15/month gets 20,000 requests for production use
- User accounts + saved trips (Supabase)
- Price alerts / fare tracking
- Multi-traveler coordination
- Train booking integration (Trainline API)
- Restaurant recommendations per city
- Packing list generator based on weather
- Currency converter widget
- Travel insurance comparison
- Mobile-first PWA version

---

## Key Design Decisions Summary

1. **Next.js App Router** — simplest path for a full-stack app with API routes, great for learning
2. **Wizard pattern** — guides user step-by-step, reduces overwhelm
3. **PHL preferred** — always search PHL first, NYC airports as fallback
4. **Premium economy locked** — simplifies flight search, matches Andy's preference
5. **Hybrid flight search** — Claude AI for free exploration/estimates + Flights Scraper Sky API for real pricing on committed routes (50 free/month) + Google Flights links as fallback
6. **Hybrid accommodations** — real Booking.com data + Claude intelligence layer
7. **Static + AI destination data** — fast initial filtering, rich AI reasoning on top
8. **Cost-first design** — budget visibility at every step, color-coded pricing
