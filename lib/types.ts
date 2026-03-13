// ─── User Input ───────────────────────────────────────────────────────────────

export interface TripPreferences {
  travelMonth: number;               // 1-12
  travelYear: number;
  durationDays: number;
  weatherPreference: 'warm' | 'mild' | 'cold' | 'any';
  tripStyle: ('culture' | 'beach' | 'adventure' | 'food' | 'nightlife' | 'history')[];
  numberOfCities: number;            // 1-5
  numberOfTravelers: number;         // 1-4
  departureAirports: string[];       // ['PHL', 'JFK', 'EWR']
  maxFlightBudgetPerPerson: number;  // default 2500
  cabinClass: 'PREMIUM_ECONOMY';
  preferNonstop: boolean;
  accommodationType: 'hotel' | 'apartment' | 'any';
  maxAccommodationPerNight: number;
}

// ─── Destination Models ────────────────────────────────────────────────────────

export interface CityRecommendation {
  cityName: string;
  iataCode: string;
  daysRecommended: number;
  topAttractions: string[];
  neighborhoods: string[];
  whyVisit: string;
}

export interface DestinationRecommendation {
  country: string;
  countryCode: string;              // ISO 2-letter for flag emoji
  cities: CityRecommendation[];
  reasoning: string;
  avgTemperatureF: number;
  weatherDescription: string;
  seasonalHighlights: string[];
}

// ─── Flight Models ─────────────────────────────────────────────────────────────

export interface FlightEstimate {
  origin: string;
  destination: string;
  nonstopAvailable: boolean;
  airlines: string[];
  priceEstimate: {
    low: number;
    typical: number;
    high: number;
  };
  isGoodDealMonth: boolean;
  tips: string;
  googleFlightsUrl: string;
  source: 'estimate';
}

export interface FlightLiveResult {
  origin: string;
  destination: string;
  price: number;
  airline: string;
  flightNumbers: string[];
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  bookingUrl: string;
  lastChecked: string;
  source: 'live';
}

export interface FlightOptions {
  destination: string;
  destinationCity: string;
  estimates: FlightEstimate[];
  liveResults?: FlightLiveResult[];
  recommendation: string;
  budgetAssessment: string;
  isWithinBudget: boolean;
}

// ─── Accommodation Models ──────────────────────────────────────────────────────

export interface AccommodationResult {
  name: string;
  type: 'hotel' | 'apartment' | 'guesthouse';
  pricePerNight: number;
  totalPrice: number;
  rating: number;
  reviewCount: number;
  neighborhood: string;
  distanceToCenter: string;
  amenities: string[];
  photoUrl: string;
  bookingUrl: string;
  aiNotes: string;
  nearbyAttractions: string[];
}

// ─── Itinerary Model ───────────────────────────────────────────────────────────

export interface TripItinerary {
  id: string;
  preferences: TripPreferences;
  destinations: DestinationRecommendation[];
  flights: {
    mainRoute: FlightOptions;
    interCity?: FlightOptions[];
    googleFlightsLinks: {
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
    estimatedDaily: number;
    total: number;
  };
  aiTripSummary: string;
}

// ─── Wizard State ──────────────────────────────────────────────────────────────

export type WizardStep = 'preferences' | 'destinations' | 'flights' | 'accommodations' | 'review';

export interface WizardState {
  step: WizardStep;
  preferences: Partial<TripPreferences>;
  selectedDestinations: DestinationRecommendation[];
  flightOptions: FlightOptions | null;
  selectedAccommodations: { cityName: string; accommodation: AccommodationResult }[];
  itinerary: TripItinerary | null;
}
