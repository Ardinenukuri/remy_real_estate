'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Plus,
  Trash2,
  Upload,
  DollarSign,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { Category } from '@/types';

const RWANDA_DISTRICTS = [
  'Nyarutarama',
  'Kacyiru',
  'Kimihurura',
  'Gacuriro',
  'Remera',
  'CBD',
  'Kanombe',
  'Kibagabaga',
  'Gisozi',
  'Nyarugenge',
];

const AVAILABLE_AMENITIES = [
  'Swimming Pool',
  'Garden',
  'Garage',
  'Air Conditioning',
  'Security',
  'Parking',
  'Smart Home',
  'Furnished',
  'Balcony',
  'Elevator',
  'Solar Power',
  'Backup Generator',
];

export default function NewListingPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('RWF');
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
  const [categoryId, setCategoryId] = useState('');
  const [district, setDistrict] = useState(RWANDA_DISTRICTS[0]);
  const [address, setAddress] = useState('');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [size, setSize] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  // Fetch categories via API
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) setCategoryId(data[0].id);
        }
      })
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const addImageField = () => {
    setImageUrls((prev) => [...prev, '']);
  };

  const removeImageField = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Filter out empty image URLs
    const validImages = imageUrls.filter((url) => url.trim() !== '');

    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    const user = storedUser ? JSON.parse(storedUser) : null;

    const payload = {
      realtor_id: user?.id,
      title,
      description,
      price: Number(price),
      currency,
      listing_type: listingType,
      category_id: categoryId,
      district,
      address,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      size: Number(size),
      amenities: selectedAmenities,
      images: validImages,
    };

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create property listing.');
      }

      // Redirect back to listings on success
      router.push('/realtor/listings');
      router.refresh();
    } catch (err: any) {
      console.error('Error creating property:', err);
      setError(err.message || 'Something went wrong while saving the listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <Link
            href="/realtor/listings"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Add New Property
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Fill out the details below to publish a new real estate listing.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            Basic Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Property Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Modern Villa with Pool in Nyarutarama"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Listing Type *
                </label>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value as 'sale' | 'rent')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Currency *
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="RWF">RWF (Rwandan Franc)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Price *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 150000000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a comprehensive description of the property features, surroundings, and terms..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Location & Specs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            Location & Specifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                District / Neighborhood *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {RWANDA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Street Address / Plot Info
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. KG 12 Ave, House #4"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Bedrooms
              </label>
              <input
                type="number"
                min="0"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Bathrooms
              </label>
              <input
                type="number"
                min="0"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Total Area (m²)
              </label>
              <input
                type="number"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. 350"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Amenities Selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Amenities & Features</h2>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_AMENITIES.map((amenity) => {
              const selected = selectedAmenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-xl border transition-all flex items-center gap-1.5 ${
                    selected
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>

        {/* Image URLs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-400" />
              Property Images (URLs)
            </h2>
            <button
              type="button"
              onClick={addImageField}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Image
            </button>
          </div>

          <div className="space-y-3">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(idx)}
                    className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/realtor/listings"
            className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium transition-all shadow-lg shadow-emerald-500/20"
          >
            {submitting ? 'Publishing Listing...' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}