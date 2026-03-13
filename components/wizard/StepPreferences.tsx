'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { TripPreferences } from '@/lib/types';
import { Plane, Users, Sun, Snowflake, Cloud, Zap } from 'lucide-react';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const TRIP_STYLES = [
  { id: 'culture', label: 'Culture & Art', emoji: '🏛️' },
  { id: 'beach', label: 'Beach', emoji: '🏖️' },
  { id: 'adventure', label: 'Adventure', emoji: '🏔️' },
  { id: 'food', label: 'Food & Wine', emoji: '🍷' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🎉' },
  { id: 'history', label: 'History', emoji: '🏰' },
] as const;

const AIRPORTS = [
  { code: 'PHL', label: 'Philadelphia (PHL)' },
  { code: 'JFK', label: 'New York JFK' },
  { code: 'EWR', label: 'Newark (EWR)' },
  { code: 'LGA', label: 'LaGuardia (LGA)' },
];

const WEATHER_OPTIONS = [
  { id: 'warm', label: 'Warm', icon: <Sun className="h-4 w-4" />, desc: '70°F+' },
  { id: 'mild', label: 'Mild', icon: <Cloud className="h-4 w-4" />, desc: '55-70°F' },
  { id: 'cold', label: 'Cold', icon: <Snowflake className="h-4 w-4" />, desc: 'Under 55°F' },
  { id: 'any', label: "Don't care", icon: <Zap className="h-4 w-4" />, desc: 'Any weather' },
] as const;

interface Props {
  preferences: Partial<TripPreferences>;
  onChange: (prefs: Partial<TripPreferences>) => void;
  onNext: () => void;
}

export default function StepPreferences({ preferences, onChange, onNext }: Props) {
  const toggle = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const currentYear = new Date().getFullYear();
  const travelYear = preferences.travelYear ?? currentYear;

  const canProceed =
    preferences.travelMonth &&
    preferences.weatherPreference &&
    preferences.tripStyle?.length &&
    preferences.departureAirports?.length &&
    preferences.durationDays &&
    preferences.numberOfTravelers;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-1">When are you traveling?</h2>
        <p className="text-sm text-gray-500">Pick your travel month and year</p>
      </div>

      {/* Year selector */}
      <div className="flex gap-2">
        {[currentYear, currentYear + 1].map((y) => (
          <Button
            key={y}
            variant={travelYear === y ? 'default' : 'outline'}
            className={travelYear === y ? 'bg-[#1e3a5f]' : ''}
            onClick={() => onChange({ ...preferences, travelYear: y })}
          >
            {y}
          </Button>
        ))}
      </div>

      {/* Month strip */}
      <div className="grid grid-cols-6 gap-2">
        {MONTHS.map((m, i) => {
          const month = i + 1;
          const selected = preferences.travelMonth === month;
          return (
            <button
              key={m}
              onClick={() => onChange({ ...preferences, travelMonth: month })}
              className={`rounded-lg py-3 text-sm font-medium transition-all border-2 ${
                selected
                  ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#1e3a5f]'
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>

      {/* Weather preference */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Weather preference</h3>
        <div className="grid grid-cols-4 gap-3">
          {WEATHER_OPTIONS.map((w) => (
            <button
              key={w.id}
              onClick={() => onChange({ ...preferences, weatherPreference: w.id })}
              className={`rounded-xl p-4 flex flex-col items-center gap-2 border-2 transition-all ${
                preferences.weatherPreference === w.id
                  ? 'border-[#ff6b6b] bg-red-50 text-[#ff6b6b]'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              {w.icon}
              <span className="text-sm font-medium">{w.label}</span>
              <span className="text-xs text-gray-400">{w.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Trip style */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Trip style <span className="text-gray-400 font-normal">(pick all that apply)</span></h3>
        <div className="flex flex-wrap gap-3">
          {TRIP_STYLES.map((s) => {
            const selected = preferences.tripStyle?.includes(s.id as TripPreferences['tripStyle'][number]);
            return (
              <button
                key={s.id}
                onClick={() =>
                  onChange({
                    ...preferences,
                    tripStyle: toggle(
                      preferences.tripStyle ?? [],
                      s.id as TripPreferences['tripStyle'][number]
                    ),
                  })
                }
                className={`rounded-full px-4 py-2 flex items-center gap-2 border-2 text-sm font-medium transition-all ${
                  selected
                    ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white'
                    : 'border-gray-200 hover:border-[#1e3a5f] text-gray-700'
                }`}
              >
                <span>{s.emoji}</span>
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-1">
          Trip duration: <span className="text-[#1e3a5f]">{preferences.durationDays ?? 10} days</span>
        </h3>
        <Slider
          min={5}
          max={21}
          step={1}
          value={[preferences.durationDays ?? 10]}
          onValueChange={(vals) => { const v = Array.isArray(vals) ? vals[0] : vals; onChange({ ...preferences, durationDays: v }); }}
          className="w-full max-w-sm"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1 max-w-sm">
          <span>5 days</span>
          <span>21 days</span>
        </div>
      </div>

      {/* Number of cities */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">How many cities?</h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => onChange({ ...preferences, numberOfCities: n })}
              className={`w-12 h-12 rounded-xl border-2 font-semibold transition-all ${
                preferences.numberOfCities === n
                  ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white'
                  : 'border-gray-200 hover:border-[#1e3a5f] text-gray-700'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Travelers */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">
          <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Number of travelers</span>
        </h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => onChange({ ...preferences, numberOfTravelers: n })}
              className={`w-12 h-12 rounded-xl border-2 font-semibold transition-all ${
                preferences.numberOfTravelers === n
                  ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white'
                  : 'border-gray-200 hover:border-[#1e3a5f] text-gray-700'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Departure airports */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">
          <span className="flex items-center gap-2"><Plane className="h-4 w-4" /> Departure airports</span>
        </h3>
        <div className="flex flex-wrap gap-3">
          {AIRPORTS.map((a) => {
            const selected = preferences.departureAirports?.includes(a.code);
            return (
              <button
                key={a.code}
                onClick={() =>
                  onChange({
                    ...preferences,
                    departureAirports: toggle(preferences.departureAirports ?? [], a.code),
                  })
                }
                className={`rounded-lg px-4 py-2 border-2 text-sm font-medium transition-all ${
                  selected
                    ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white'
                    : 'border-gray-200 hover:border-[#1e3a5f] text-gray-700'
                }`}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-1">
          Max flight budget: <span className="text-[#1e3a5f]">${(preferences.maxFlightBudgetPerPerson ?? 2500).toLocaleString()}/person</span>
        </h3>
        <Slider
          min={800}
          max={5000}
          step={100}
          value={[preferences.maxFlightBudgetPerPerson ?? 2500]}
          onValueChange={(vals) => { const v = Array.isArray(vals) ? vals[0] : vals; onChange({ ...preferences, maxFlightBudgetPerPerson: v }); }}
          className="w-full max-w-sm"
        />
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-1">
          Max accommodation: <span className="text-[#1e3a5f]">${(preferences.maxAccommodationPerNight ?? 200).toLocaleString()}/night</span>
        </h3>
        <Slider
          min={50}
          max={600}
          step={25}
          value={[preferences.maxAccommodationPerNight ?? 200]}
          onValueChange={(vals) => { const v = Array.isArray(vals) ? vals[0] : vals; onChange({ ...preferences, maxAccommodationPerNight: v }); }}
          className="w-full max-w-sm"
        />
      </div>

      <Button
        onClick={onNext}
        disabled={!canProceed}
        className="bg-[#ff6b6b] hover:bg-[#ff5252] text-white px-8 py-3 text-base font-semibold disabled:opacity-40"
      >
        Find My Destinations →
      </Button>
    </div>
  );
}
