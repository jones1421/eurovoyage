'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DestinationRecommendation } from '@/lib/types';
import { Thermometer, MapPin } from 'lucide-react';

interface Props {
  destination: DestinationRecommendation;
  isSelected: boolean;
  onSelect: () => void;
  maxCities: number;
  currentSelected: number;
}

function getFlagEmoji(countryCode: string): string {
  if (!countryCode) return '🌍';
  const codePoints = countryCode.toUpperCase().split('').map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function DestinationCard({ destination, isSelected, onSelect, maxCities, currentSelected }: Props) {
  const canSelect = isSelected || currentSelected < maxCities;

  return (
    <Card
      onClick={canSelect ? onSelect : undefined}
      className={`cursor-pointer transition-all border-2 ${
        isSelected
          ? 'border-[#ff6b6b] bg-red-50/30 shadow-md'
          : canSelect
          ? 'border-gray-200 hover:border-[#1e3a5f] hover:shadow-sm'
          : 'border-gray-100 opacity-60 cursor-not-allowed'
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getFlagEmoji(destination.countryCode)}</span>
            <div>
              <h3 className="text-lg font-bold text-[#1e3a5f]">{destination.country}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                <Thermometer className="h-3 w-3" />
                <span>{destination.avgTemperatureF}°F · {destination.weatherDescription}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {isSelected && (
              <Badge className="bg-[#ff6b6b] text-white">✓ Selected</Badge>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-3 leading-relaxed">{destination.reasoning}</p>

        {/* Cities */}
        <div className="mt-4 space-y-2">
          {destination.cities.map((city, i) => (
            <div key={i} className="flex items-start gap-2">
              <MapPin className="h-3 w-3 text-[#ff6b6b] mt-1 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-800">{city.cityName}</span>
                <span className="text-xs text-gray-400 ml-2">({city.iataCode}) · {city.daysRecommended} days</span>
                <p className="text-xs text-gray-500 mt-0.5">{city.whyVisit}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Highlights */}
        {destination.seasonalHighlights?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {destination.seasonalHighlights.slice(0, 3).map((h, i) => (
              <Badge key={i} variant="outline" className="text-xs text-gray-600">
                {h}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
