'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FlightEstimate, FlightLiveResult } from '@/lib/types';
import { ExternalLink, Plane } from 'lucide-react';

interface Props {
  estimate: FlightEstimate;
  liveResults?: FlightLiveResult[];
  maxBudget: number;
}

function priceColor(price: number, max: number): string {
  if (price <= 1500) return 'text-green-600';
  if (price <= 2200) return 'text-yellow-600';
  if (price <= max) return 'text-orange-600';
  return 'text-red-600';
}

function priceBg(price: number, max: number): string {
  if (price <= 1500) return 'bg-green-50 border-green-200';
  if (price <= 2200) return 'bg-yellow-50 border-yellow-200';
  if (price <= max) return 'bg-orange-50 border-orange-200';
  return 'bg-red-50 border-red-200';
}

export default function FlightResultCard({ estimate, liveResults, maxBudget }: Props) {
  const hasLive = liveResults && liveResults.length > 0;
  const displayPrice = hasLive ? liveResults![0].price : estimate.priceEstimate.typical;

  return (
    <Card className={`border ${priceBg(displayPrice, maxBudget)}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Plane className="h-5 w-5 text-[#1e3a5f] flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{estimate.origin}</span>
                <span className="text-gray-400">→</span>
                <span className="font-bold text-gray-900">{estimate.destination}</span>
                {estimate.nonstopAvailable && (
                  <Badge className="bg-blue-100 text-blue-700 text-xs">Nonstop available</Badge>
                )}
                {hasLive ? (
                  <Badge className="bg-green-100 text-green-700 text-xs">Live Price</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-gray-500">Estimated</Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {estimate.airlines.slice(0, 2).join(' · ')}
              </p>
              {estimate.tips && (
                <p className="text-xs text-gray-600 mt-1 italic">{estimate.tips}</p>
              )}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            {hasLive ? (
              <p className={`text-xl font-bold ${priceColor(displayPrice, maxBudget)}`}>
                ${displayPrice.toLocaleString()}
              </p>
            ) : (
              <div>
                <p className={`text-xl font-bold ${priceColor(estimate.priceEstimate.typical, maxBudget)}`}>
                  ~${estimate.priceEstimate.typical.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">
                  ${estimate.priceEstimate.low.toLocaleString()} – ${estimate.priceEstimate.high.toLocaleString()}
                </p>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-0.5">per person · premium economy</p>
          </div>
        </div>

        {/* Live flight options */}
        {hasLive && liveResults!.length > 1 && (
          <div className="mt-3 space-y-2 border-t border-gray-200 pt-3">
            {liveResults!.slice(0, 3).map((r, i) => (
              <div key={i} className="flex justify-between text-xs text-gray-600">
                <span>{r.airline} · {r.stops === 0 ? 'Nonstop' : `${r.stops} stop`}</span>
                <span className="font-medium">${r.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3">
          <a
            href={estimate.googleFlightsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#1e3a5f] hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            View on Google Flights
          </a>
          {estimate.isGoodDealMonth && (
            <Badge className="ml-3 bg-green-100 text-green-700 text-xs">Good deal month</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
