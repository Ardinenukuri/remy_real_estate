'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MapPin,
  Heart,
  Calendar,
  MessageSquare,
  ChevronLeft,
  Building2,
  Check,
  Loader2,
  Share2,
  Phone,
  Mail,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PropertyMap } from '@/components/PropertyMap';

interface PropertyDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'sale' | 'rent';
  district: string;
  address: string;
  beds: number;
  baths: number;
  area_sqm: number;
  image_url: string;
  images: string[];
  status: string;
  latitude?: number | null;
  longitude?: number | null;
  realtor: {
    id: string | null;
    name: string;
    phone: string;
    email: string;
  };
  amenities: string[];
}

function PropertyDetailContent() {
  const params = useParams();
  const propertyId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    async function fetchProperty() {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const [propRes, savedRes] = await Promise.all([
          fetch(`/api/customer/properties/${propertyId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/customer/saved-properties', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (propRes.ok) {
          const data = await propRes.json();
          setProperty(data.property || data);
        } else {
          setProperty(null);
        }

        if (savedRes.ok) {
          const savedData = await savedRes.json();
          setIsSaved((savedData.properties || []).some((s: any) => s.id === propertyId));
        }
      } catch (err) {
        console.error('Failed to fetch property:', err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [propertyId]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/properties/${propertyId}`;
    const shareData = {
      title: property?.title || 'Property Listing',
      text: `Check out this property on Remy Real Estates: ${property?.title || ''}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      // User cancelled the share sheet - not an error worth surfacing.
    }
  };

  const handleToggleSave = async () => {
    setSaving(true);
    const wasSaved = isSaved;
    try {
      const token = localStorage.getItem('accessToken');
      if (wasSaved) {
        await fetch(`/api/customer/saved-properties?id=${propertyId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await fetch('/api/customer/saved-properties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ property_id: propertyId }),
        });
      }
      setIsSaved(!wasSaved);
    } catch (err) {
      console.error('Failed to toggle save:', err);
    } finally {
      setSaving(false);
    }
  };

  const images = property?.images?.length ? property.images : property?.image_url ? [property.image_url] : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-24">
        <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Property Not Found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">The property you're looking for doesn't exist.</p>
        <Link
          href="/customer/saved"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Saved Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/customer/saved"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Saved Properties
      </Link>

      {/* Property Hero Image */}
      <div className="space-y-3">
        <div
          onClick={() => images.length > 0 && setLightboxOpen(true)}
          className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer group"
        >
          {images.length > 0 ? (
            <img
              src={images[selectedImageIndex]}
              alt={property.title}
              className="w-full h-72 md:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-72 md:h-96 bg-white dark:bg-slate-900 flex items-center justify-center">
              <Building2 className="w-10 h-10 text-slate-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span
              className={cn(
                'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-white shadow-md',
                property.type === 'sale' ? 'bg-emerald-600' : 'bg-blue-600'
              )}
            >
              For {property.type === 'sale' ? 'Sale' : 'Rent'}
            </span>
            <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/20">
              {property.status}
            </span>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleSave();
              }}
              disabled={saving}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/80 backdrop-blur-md text-rose-400 hover:bg-rose-600 hover:text-white transition-all shadow-md"
              title={isSaved ? 'Remove from Saved' : 'Save Property'}
            >
              <Heart className={cn('w-5 h-5', isSaved && 'fill-rose-400')} />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/80 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-md"
              title="Share Property"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {images.length > 1 && (
            <span className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/70 backdrop-blur-md text-slate-900 dark:text-white text-xs font-semibold rounded-xl">
              {selectedImageIndex + 1} / {images.length} Photos
            </span>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{property.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {property.district}, {property.address}
              </span>
            </div>
          </div>
        </div>

        {/* All Uploaded Image Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImageIndex(i)}
                className={cn(
                  'relative h-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all',
                  selectedImageIndex === i
                    ? 'border-emerald-500 ring-2 ring-emerald-500/40 scale-105'
                    : 'border-transparent opacity-70 hover:opacity-100'
                )}
              >
                <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{property.beds}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">Bedrooms</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{property.baths}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">Bathrooms</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{property.area_sqm}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">m² Area</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-2xl font-bold text-emerald-400">
            RWF {property.price.toLocaleString()}
            {property.type === 'rent' && <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/mo</span>}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">Price</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">About This Property</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{property.description}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Amenities & Features</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                >
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-600 dark:text-slate-300">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Location</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{property.address || property.district}</p>
            <PropertyMap
              latitude={property.latitude}
              longitude={property.longitude}
              title={property.title}
              className="h-72 w-full rounded-xl overflow-hidden"
            />
          </div>
        </div>

        {/* Right: Realtor Card & Actions */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Listed By</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-lg">
                {property.realtor.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{property.realtor.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Licensed Realtor</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <a
                href={`tel:${property.realtor.phone}`}
                className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-slate-600 dark:text-slate-500" />
                {property.realtor.phone}
              </a>
              <a
                href={`mailto:${property.realtor.email}`}
                className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-slate-600 dark:text-slate-500" />
                {property.realtor.email}
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href={`/customer/schedule/${propertyId}`}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Calendar className="w-4 h-4" />
              Schedule Viewing
            </Link>
            <Link
              href={
                property?.realtor?.id
                  ? `/customer/messages?realtor_id=${property.realtor.id}&property_id=${propertyId}`
                  : '/customer/messages'
              }
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-semibold transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Contact Realtor
            </Link>
          </div>
        </div>
      </div>

      {/* Fullscreen Gallery Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 backdrop-blur-md">
          <div className="w-full max-w-7xl flex items-center justify-between text-slate-900 dark:text-white py-2">
            <span className="text-sm font-semibold">
              Photo {selectedImageIndex + 1} of {images.length} - {property.title}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center">
            <button
              onClick={() =>
                setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
              }
              className="absolute left-2 z-10 p-3 rounded-full bg-black/50 hover:bg-emerald-500 text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={images[selectedImageIndex]}
              alt={`Full view ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            />

            <button
              onClick={() =>
                setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
              }
              className="absolute right-2 z-10 p-3 rounded-full bg-black/50 hover:bg-emerald-500 text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-4 px-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={cn(
                  'w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all',
                  selectedImageIndex === idx ? 'border-emerald-400 ring-2 ring-emerald-400' : 'opacity-40'
                )}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerPropertyDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 dark:text-slate-400">Loading property...</div>}>
      <PropertyDetailContent />
    </Suspense>
  );
}