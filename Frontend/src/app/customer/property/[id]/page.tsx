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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  status: string;
  realtor: {
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

  useEffect(() => {
    async function fetchProperty() {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/customer/properties/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProperty(data.property || data);
        } else {
          setProperty({
            id: propertyId || '1',
            title: 'Modern Luxury Villa in Kiyovu',
            description: 'A stunning modern villa with panoramic views, featuring 4 spacious bedrooms, 3 luxurious bathrooms, and a beautifully landscaped garden. Perfect for families seeking premium living in the heart of Kigali.',
            price: 350000,
            type: 'sale',
            district: 'Kiyovu',
            address: 'KN 14 Ave, Kigali',
            beds: 4,
            baths: 3,
            area_sqm: 320,
            image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
            status: 'available',
            realtor: {
              name: 'Eric Manzi',
              phone: '+250 788 123 456',
              email: 'eric.m@remy.com',
            },
            amenities: ['Swimming Pool', 'Garden', 'Garage', 'Air Conditioning', 'Security', 'Parking'],
          });
        }
      } catch (err) {
        console.error('Failed to fetch property:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [propertyId]);

  const handleToggleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (isSaved) {
        await fetch(`/api/customer/saved-properties/${propertyId}`, {
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
      setIsSaved(!isSaved);
    } catch (err) {
      console.error('Failed to toggle save:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-xs text-slate-400">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-24">
        <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-1">Property Not Found</h3>
        <p className="text-sm text-slate-400 mb-6">The property you're looking for doesn't exist.</p>
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
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Saved Properties
      </Link>

      {/* Property Hero Image */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800">
        <img
          src={property.image_url}
          alt={property.title}
          className="w-full h-72 md:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span
            className={cn(
              'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white shadow-md',
              property.type === 'sale' ? 'bg-emerald-600' : 'bg-blue-600'
            )}
          >
            For {property.type === 'sale' ? 'Sale' : 'Rent'}
          </span>
          <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/20">
            {property.status}
          </span>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={handleToggleSave}
            disabled={saving}
            className="p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-rose-400 hover:bg-rose-600 hover:text-white transition-all shadow-md"
            title={isSaved ? 'Remove from Saved' : 'Save Property'}
          >
            <Heart className={cn('w-5 h-5', isSaved && 'fill-rose-400')} />
          </button>
          <button
            className="p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-slate-300 hover:text-white transition-all shadow-md"
            title="Share Property"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">{property.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              {property.district}, {property.address}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-2xl font-bold text-white">{property.beds}</span>
          <span className="text-xs text-slate-400 block mt-1">Bedrooms</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-2xl font-bold text-white">{property.baths}</span>
          <span className="text-xs text-slate-400 block mt-1">Bathrooms</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-2xl font-bold text-white">{property.area_sqm}</span>
          <span className="text-xs text-slate-400 block mt-1">m² Area</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-2xl font-bold text-emerald-400">
            ${property.price.toLocaleString()}
            {property.type === 'rent' && <span className="text-xs text-slate-400 font-normal">/mo</span>}
          </span>
          <span className="text-xs text-slate-400 block mt-1">Price</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-4">About This Property</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{property.description}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-4">Amenities & Features</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800"
                >
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-300">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Realtor Card & Actions */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Listed By</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-lg">
                {property.realtor.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{property.realtor.name}</p>
                <p className="text-xs text-slate-400">Licensed Realtor</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <a
                href={`tel:${property.realtor.phone}`}
                className="flex items-center gap-2 text-xs text-slate-300 hover:text-emerald-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                {property.realtor.phone}
              </a>
              <a
                href={`mailto:${property.realtor.email}`}
                className="flex items-center gap-2 text-xs text-slate-300 hover:text-emerald-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
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
              href={`/customer/messages`}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Contact Realtor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerPropertyDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading property...</div>}>
      <PropertyDetailContent />
    </Suspense>
  );
}