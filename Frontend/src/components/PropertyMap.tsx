'use client';

import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

const PropertyMapInner = dynamic(() => import('./PropertyMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
      Loading map...
    </div>
  ),
});

export function PropertyMap({
  latitude,
  longitude,
  title,
  className,
}: {
  latitude?: number | null;
  longitude?: number | null;
  title?: string;
  className?: string;
}) {
  if (latitude == null || longitude == null) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 text-slate-400 ${className || ''}`}>
        <MapPin className="w-8 h-8 mb-2" />
        <p className="text-xs">Location not pinned on the map yet.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <PropertyMapInner latitude={latitude} longitude={longitude} title={title} />
    </div>
  );
}
