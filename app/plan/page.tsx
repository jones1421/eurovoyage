'use client';

import { useState } from 'react';
import {
  TripPreferences, DestinationRecommendation, FlightOptions,
  AccommodationResult, TripItinerary, WizardState, WizardStep,
} from '@/lib/types';
import ItineraryStepper from '@/components/ItineraryStepper';
import TripSidebar from '@/components/TripSidebar';
import StepPreferences from '@/components/wizard/StepPreferences';
import StepDestinations from '@/components/wizard/StepDestinations';
import StepFlights from '@/components/wizard/StepFlights';
import StepAccommodations from '@/components/wizard/StepAccommodations';
import StepReview from '@/components/wizard/StepReview';

const INITIAL_PREFS: Partial<TripPreferences> = {
  travelYear: new Date().getFullYear() + 1,
  durationDays: 10,
  numberOfCities: 2,
  numberOfTravelers: 1,
  departureAirports: ['PHL'],
  maxFlightBudgetPerPerson: 2500,
  cabinClass: 'PREMIUM_ECONOMY',
  preferNonstop: true,
  accommodationType: 'any',
  maxAccommodationPerNight: 200,
  tripStyle: [],
};

export default function PlanPage() {
  const [step, setStep] = useState<WizardStep>('preferences');
  const [preferences, setPreferences] = useState<Partial<TripPreferences>>(INITIAL_PREFS);
  const [destinations, setDestinations] = useState<DestinationRecommendation[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<DestinationRecommendation[]>([]);
  const [flightOptions, setFlightOptions] = useState<FlightOptions | null>(null);
  const [selectedAccommodations, setSelectedAccommodations] = useState<{ cityName: string; accommodation: AccommodationResult }[]>([]);
  const [itinerary, setItinerary] = useState<TripItinerary | null>(null);

  const wizardState: WizardState = {
    step,
    preferences,
    selectedDestinations,
    flightOptions,
    selectedAccommodations,
    itinerary,
  };

  const toggleDestination = (dest: DestinationRecommendation) => {
    setSelectedDestinations((prev) => {
      const exists = prev.some((d) => d.country === dest.country);
      if (exists) return prev.filter((d) => d.country !== dest.country);
      if (prev.length >= (preferences.numberOfCities ?? 2)) return prev;
      return [...prev, dest];
    });
  };

  const selectAccommodation = (cityName: string, accommodation: AccommodationResult) => {
    setSelectedAccommodations((prev) => {
      const filtered = prev.filter((a) => a.cityName !== cityName);
      return [...filtered, { cityName, accommodation }];
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Stepper */}
      <div className="mb-8">
        <ItineraryStepper currentStep={step} />
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-8">
        {/* Main content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          {step === 'preferences' && (
            <StepPreferences
              preferences={preferences}
              onChange={setPreferences}
              onNext={() => setStep('destinations')}
            />
          )}

          {step === 'destinations' && (
            <StepDestinations
              preferences={preferences}
              destinations={destinations}
              selected={selectedDestinations}
              onSelect={toggleDestination}
              onLoad={setDestinations}
              onNext={() => setStep('flights')}
              onBack={() => setStep('preferences')}
            />
          )}

          {step === 'flights' && (
            <StepFlights
              preferences={preferences}
              destinations={selectedDestinations}
              flightOptions={flightOptions}
              onFlightOptions={setFlightOptions}
              onNext={() => setStep('accommodations')}
              onBack={() => setStep('destinations')}
            />
          )}

          {step === 'accommodations' && (
            <StepAccommodations
              preferences={preferences}
              destinations={selectedDestinations}
              selectedAccommodations={selectedAccommodations}
              onSelectAccommodation={selectAccommodation}
              onNext={() => setStep('review')}
              onBack={() => setStep('flights')}
            />
          )}

          {step === 'review' && (
            <StepReview
              state={wizardState}
              itinerary={itinerary}
              onGenerate={setItinerary}
              onBack={() => setStep('accommodations')}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <TripSidebar state={wizardState} />
        </div>
      </div>
    </div>
  );
}
