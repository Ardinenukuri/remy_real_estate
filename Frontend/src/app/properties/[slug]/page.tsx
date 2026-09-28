'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  CheckCircle2,
  Phone,
  MessageSquare,
  BadgeCheck,
  Share2,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
} from 'lucide-react';
import { PropertyMap } from '@/components/PropertyMap';

export default function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const propertyId = params.slug;

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Viewing Schedule Form State
  const [tourData, setTourData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '10:00',
    notes: '',
  });
  const [submittingTour, setSubmittingTour] = useState(false);
  const [tourSuccess, setTourSuccess] = useState(false);

  // Load property details
  useEffect(() => {
    async function loadProperty() {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const res = await fetch(`/api/properties/${propertyId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          const p = data.property || data;
          setProperty(p);
        } else {
          setProperty(null);
        }

        if (token) {
          const savedRes = await fetch('/api/customer/saved-properties', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (savedRes.ok) {
            const savedData = await savedRes.json();
            setIsSaved((savedData.properties || []).some((s: any) => s.id === propertyId));
          }
        }
      } catch (err) {
        console.error('Failed to load property details:', err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [propertyId]);

  // Handle Save / Favorite toggle
  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
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
    if (!property) return;

    const wasSaved = isSaved;
    setIsSaved(!wasSaved);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsSaved(wasSaved);
        return;
      }
      if (wasSaved) {
        await fetch(`/api/customer/saved-properties?id=${property.id || propertyId}`, {
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
          body: JSON.stringify({ property_id: property.id || propertyId }),
        });
      }
    } catch {
      setIsSaved(wasSaved);
    }
  };

  // Handle Schedule Viewing Tour Submit
  const handleScheduleTour = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTour(true);
    setTourSuccess(false);

    try {
      const token = localStorage.getItem('accessToken');
      await fetch('/api/customer/tours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          property_id: property?.id || propertyId,
          name: tourData.name,
          email: tourData.email,
          phone: tourData.phone,
          tour_date: tourData.date || new Date().toISOString().split('T')[0],
          tour_time: tourData.time || '10:00',
          notes: tourData.notes,
        }),
      });
      setTourSuccess(true);
      setTourData({ name: '', email: '', phone: '', date: '', time: '10:00', notes: '' });
    } catch (err) {
      console.error('Failed to schedule tour:', err);
    } finally {
      setSubmittingTour(false);
    }
  };

  const images: string[] = property?.images?.length ? property.images : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--emerald)] mb-3" />
        <p className="text-sm text-slate-400 dark:text-slate-500">Loading property details & gallery...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background pt-24 flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-heading text-2xl font-bold text-[var(--navy)] dark:text-white mb-2">Property Not Found</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300 mb-6">This listing doesn't exist or is no longer available.</p>
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--emerald)] hover:bg-emerald-600 text-white text-xs font-semibold"
        >
          Browse Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      {/* Header */}
      <div className="bg-[var(--navy)] text-white py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-3">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-white">
              Properties
            </Link>
            <span>/</span>
            <span className="text-white capitalize">{property?.title}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-[var(--emerald)] text-white text-xs font-semibold rounded-lg uppercase">
                  {property?.listing_type || 'For Sale'}
                </span>
                <span className="px-3 py-1 bg-amber-400 text-white text-xs font-semibold rounded-lg">
                  Verified Listing
                </span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold">{property?.title}</h1>
              <div className="flex items-center gap-2 text-white/70 text-sm mt-1">
                <MapPin className="w-4 h-4 text-[var(--emerald)]" />
                <span>{property?.address || property?.district || 'Kigali, Rwanda'}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-left md:text-right">
                <p className="text-white/60 text-xs uppercase tracking-wider">Asking Price</p>
                <p className="text-3xl font-extrabold text-[var(--emerald)]">
                  RWF {Number(property?.price || 0).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleSave}
                  className={`p-3 rounded-xl transition-all flex items-center gap-2 text-xs font-bold ${
                    isSaved
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  aria-label="Save Property"
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                  aria-label="Share Property"
                  title="Share Property"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Multi-Photo Gallery & Specs) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Interactive Multi-Image Gallery */}
            <div className="space-y-4">
              {images.length > 0 ? (
                <div
                  onClick={() => setLightboxOpen(true)}
                  className="relative h-[440px] rounded-2xl overflow-hidden bg-slate-900 shadow-xl cursor-pointer group"
                >
                  <Image
                    src={images[selectedImageIndex]}
                    alt="Property Main View"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-4 py-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-xl border border-white/20">
                      Click to View All {images.length} Photos Fullscreen
                    </span>
                  </div>
                  {images.length > 1 && (
                    <span className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/70 backdrop-blur-md text-white text-xs font-semibold rounded-xl">
                      {selectedImageIndex + 1} / {images.length} Photos
                    </span>
                  )}
                </div>
              ) : (
                <div className="h-[440px] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-xl flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                  No photos uploaded for this listing yet.
                </div>
              )}

              {/* All Uploaded Image Thumbnails Strip */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImageIndex === i
                          ? 'border-[var(--emerald)] ring-2 ring-[var(--emerald)]/40 scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Key Specs Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[var(--emerald)] flex items-center justify-center">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Bedrooms</p>
                  <p className="text-sm font-bold text-[var(--navy)] dark:text-white">{property?.bedrooms || 3} Beds</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Bath className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Bathrooms</p>
                  <p className="text-sm font-bold text-[var(--navy)] dark:text-white">{property?.bathrooms || 2} Baths</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Total Area</p>
                  <p className="text-sm font-bold text-[var(--navy)] dark:text-white">{property?.size || 350} m²</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Status</p>
                  <p className="text-sm font-bold text-[var(--navy)] dark:text-white capitalize">{property?.status || 'Available'}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="font-heading text-2xl font-bold text-[var(--navy)] dark:text-white">About This Property</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {property?.description ||
                  'Situated in Kigali\'s prime neighborhood, this property offers an exceptional living experience with open-concept living rooms, modern finishing, manicured landscaping, and scenic views.'}
              </p>
            </div>

            {/* Amenities Checklist */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="font-heading text-2xl font-bold text-[var(--navy)] dark:text-white">Amenities & Features</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(property?.amenities || [
                  'Swimming Pool',
                  'Manicured Garden',
                  '24/7 Security Guard',
                  'Panoramic Views',
                  'High-Speed Internet',
                  'Backup Generator',
                ]).map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-2.5 text-slate-700 dark:text-slate-100 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[var(--emerald)] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Map */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="font-heading text-2xl font-bold text-[var(--navy)] dark:text-white">Location</h2>
              <p className="text-slate-500 dark:text-slate-300 text-xs">
                {property?.address || property?.district || 'Kigali, Rwanda'}
              </p>
              <PropertyMap
                latitude={property?.latitude}
                longitude={property?.longitude}
                title={property?.title}
                className="h-80 w-full rounded-xl overflow-hidden"
              />
            </div>
          </div>

          {/* Right Column (Realtor & Persistent Viewing Booking Form) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {property.realtor?.avatar_url ? (
                    <Image
                      src={property.realtor.avatar_url}
                      alt={property.realtor?.name || 'Realtor'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-[var(--emerald)]">
                      {(property.realtor?.name || 'R').charAt(0)}
                    </span>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--emerald)] rounded-full flex items-center justify-center border-2 border-white">
                    <BadgeCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[var(--navy)] dark:text-white text-base">{property.realtor?.name || 'Remy Real Estate'}</h3>
                  <p className="text-[var(--emerald)] text-xs font-medium">Listing Agent</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Verified Realtor</p>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={`tel:${property.realtor?.phone || '+250788000000'}`}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--navy)] hover:bg-[var(--emerald)] text-white font-semibold rounded-xl text-xs transition-colors shadow"
                >
                  <Phone className="w-4 h-4" /> Call Realtor ({property.realtor?.phone || '+250 788 000 000'})
                </a>
              </div>

              {/* Schedule Viewing Form */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="font-semibold text-[var(--navy)] dark:text-white text-sm">Schedule a Viewing Tour</h4>

                {tourSuccess ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                      <Check className="w-5 h-5 text-emerald-600" /> Tour Scheduled!
                    </div>
                    <p>
                      Your viewing request has been saved to your dashboard. The realtor will contact you shortly to confirm the appointment.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleScheduleTour} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={tourData.name}
                        onChange={(e) => setTourData({ ...tourData, name: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={tourData.email}
                        onChange={(e) => setTourData({ ...tourData, email: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+250 788 ..."
                        value={tourData.phone}
                        onChange={(e) => setTourData({ ...tourData, phone: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Preferred Date *</label>
                      <input
                        type="date"
                        required
                        value={tourData.date}
                        onChange={(e) => setTourData({ ...tourData, date: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingTour}
                      className="w-full py-3 bg-[var(--emerald)] hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-colors shadow"
                    >
                      {submittingTour ? 'Scheduling...' : 'Request Viewing Tour'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Gallery Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 backdrop-blur-md">
          <div className="w-full max-w-7xl flex items-center justify-between text-white py-2">
            <span className="text-sm font-semibold">
              Photo {selectedImageIndex + 1} of {images.length} - {property?.title}
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
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                  selectedImageIndex === idx ? 'border-emerald-400 ring-2 ring-emerald-400' : 'opacity-40'
                }`}
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
