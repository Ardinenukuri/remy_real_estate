'use client';

import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

const LocationPickerInner = dynamic(() => import('./LocationPickerInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-500 text-xs">
      Loading map...
    </div>
  ),
});

// Kigali city center - used as a sensible default so the picker always opens
// somewhere useful even before the realtor has clicked anywhere.
const DEFAULT_LAT = -1.9441;
const DEFAULT_LNG = 30.0619;

export function LocationPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const lat = latitude ?? DEFAULT_LAT;
  const lng = longitude ?? DEFAULT_LNG;

  return (
    <div className="space-y-2">
      <div className="h-64 rounded-xl overflow-hidden border border-slate-800">
        <LocationPickerInner latitude={lat} longitude={lng} onChange={onChange} />
      </div>
      <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 shrink-0" />
        {latitude != null && longitude != null
          ? `Pinned at ${lat.toFixed(5)}, ${lng.toFixed(5)}`
          : 'Click on the map or drag the pin to set the exact property location.'}
      </p>
    </div>
  );
}
