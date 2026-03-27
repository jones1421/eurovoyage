'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AccommodationResult } from '@/lib/types';
import { Star, MapPin, ExternalLink } from 'lucide-react';

interface Props {
  accommodation: AccommodationResult;
  isSelected: boolean;
  onSelect: () => void;
  nights: number;
}

export default function AccommodationCard({ accommodation, isSelected, onSelect, nights }: Props) {
  const total = accommodation.pricePerNight * nights;

  return (
    <Card
      onClick={onSelect}
      className={`cursor-pointer transition-all border-2 ${
        isSelected
          ? 'border-[#ff6b6b] bg-red-50/20 shadow-md'
          : 'border-gray-200 hover:border-[#1e3a5f] hover:shadow-sm'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {accommodation.photoUrl ? (
            <img
              src={accommodation.photoUrl}
              alt={accommodation.name}
              className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">🏨</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-gray-900 leading-tight">{accommodation.name}</h4>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  <span>{accommodation.neighborhood} · {accommodation.distanceToCenter}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-[#1e3a5f]">${accommodation.pricePerNight}<span className="text-sm font-normal text-gray-400">/night</span></p>
                <p className="text-xs text-gray-500">${total.toLocaleString()} total ({nights} nights)</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded text-blue-700 text-xs font-semibold">
                <Star className="h-3 w-3 fill-current" />
                {accommodation.rating.toFixed(1)}
              </div>
              <span className="text-xs text-gray-400">{accommodation.reviewCount?.toLocaleString()} reviews</span>
              <Badge variant="outline" className="text-xs capitalize">{accommodation.type}</Badge>
              {isSelected && <Badge className="bg-[#ff6b6b] text-white text-xs ml-auto">✓ Selected</Badge>}
            </div>

            {accommodation.aiNotes && (
              <p className="text-xs text-indigo-700 mt-2 bg-indigo-50 rounded p-2 leading-relaxed">
                ✨ {accommodation.aiNotes}
              </p>
            )}

            {accommodation.amenities?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {accommodation.amenities.slice(0, 4).map((a, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
                ))}
              </div>
            )}

            {accommodation.bookingUrl && (
              <a
                href={accommodation.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-[#1e3a5f] hover:underline mt-2"
              >
                <ExternalLink className="h-3 w-3" />
                View on Booking.com
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
