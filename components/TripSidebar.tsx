'use client';

import { Separator } from '@/components/ui/separator';
import { WizardState } from '@/lib/types';
import { Calendar, Users, MapPin, Plane, Hotel, DollarSign } from 'lucide-react';

interface Props {
  state: WizardState;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function TripSidebar({ state }: Props) {
  const { preferences, selectedDestinations, flightOptions, selectedAccommodations } = state;

  const monthLabel = preferences.travelMonth ? MONTHS[preferences.travelMonth - 1] : null;
  const flightEstimate = flightOptions?.estimates?.[0]?.priceEstimate?.typical;
  const accTotal = selectedAccommodations.reduce((sum, a) => sum + (a.accommodation.pricePerNight * 3), 0);

  return (
    <aside className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-4 h-fit">
      <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wide mb-4">Your Trip</h3>

      <div className="space-y-4 text-sm">
        {/* Dates */}
        {monthLabel && (
          <div className="flex items-center gap-3 text-gray-700">
            <Calendar className="h-4 w-4 text-[#ff6b6b] flex-shrink-0" />
            <div>
              <p className="font-medium">{monthLabel} {preferences.travelYear}</p>
              {preferences.durationDays && (
                <p className="text-xs text-gray-400">{preferences.durationDays} days</p>
              )}
            </div>
          </div>
        )}

        {/* Travelers */}
        {preferences.numberOfTravelers && (
          <div className="flex items-center gap-3 text-gray-700">
            <Users className="h-4 w-4 text-[#ff6b6b] flex-shrink-0" />
            <span>{preferences.numberOfTravelers} traveler{preferences.numberOfTravelers > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Style */}
        {preferences.tripStyle?.length ? (
          <div className="flex items-center gap-3 text-gray-700">
            <span className="text-[#ff6b6b]">✦</span>
            <span className="capitalize">{preferences.tripStyle.slice(0, 2).join(', ')}</span>
          </div>
        ) : null}

        {selectedDestinations.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Destinations</p>
              {selectedDestinations.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-700">
                  <MapPin className="h-3 w-3 text-[#ff6b6b]" />
                  <span>{d.country}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {flightOptions && (
          <>
            <Separator />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Plane className="h-3 w-3 text-[#ff6b6b]" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Flights</span>
              </div>
              <p className="text-gray-700">
                ~${flightEstimate?.toLocaleString() ?? '?'}<span className="text-xs text-gray-400">/person est.</span>
              </p>
              <p className={`text-xs font-medium ${flightOptions.isWithinBudget ? 'text-green-600' : 'text-red-500'}`}>
                {flightOptions.isWithinBudget ? '✓ Within budget' : '⚠ Over budget'}
              </p>
            </div>
          </>
        )}

        {selectedAccommodations.length > 0 && (
          <>
            <Separator />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Hotel className="h-3 w-3 text-[#ff6b6b]" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Accommodation</span>
              </div>
              {selectedAccommodations.map((a, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-600">
                  <span>{a.cityName}</span>
                  <span>${a.accommodation.pricePerNight}/night</span>
                </div>
              ))}
            </div>
          </>
        )}

        {(flightEstimate || accTotal > 0) && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#ff6b6b]" />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Est. Total</span>
              </div>
              <span className="font-bold text-[#1e3a5f]">
                ${((flightEstimate ?? 0) * (preferences.numberOfTravelers ?? 1) + accTotal).toLocaleString()}
              </span>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
