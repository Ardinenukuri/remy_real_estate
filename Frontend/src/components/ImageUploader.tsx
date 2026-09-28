'use client';

import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onChange, maxImages = 10 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = async (files: FileList | File[]) => {
    setUploading(true);
    const newImageUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        // Try uploading to server endpoint first
        const token = localStorage.getItem('accessToken');
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/realtor/upload', {
          method: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            newImageUrls.push(data.url);
            continue;
          }
        }
      } catch (err) {
        // Fallback to FileReader base64 Data URL if server endpoint isn't active
      }

      // FileReader fallback for instant local preview
      const base64Url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      newImageUrls.push(base64Url);
    }

    // Filter out empty entries and append new uploads
    const updatedList = [...images.filter((img) => img.trim() !== ''), ...newImageUrls].slice(
      0,
      maxImages
    );
    onChange(updatedList);
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const validImages = images.filter((img) => img.trim() !== '');

  return (
    <div className="space-y-4">
      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-slate-800 bg-slate-950/60 hover:border-emerald-500/50 hover:bg-slate-900'
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              {uploading ? 'Processing photos...' : 'Click or Drag & Drop Property Photos Here'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports PNG, JPG, JPEG, WebP (Upload up to {maxImages} images)
            </p>
          </div>
        </div>
      </div>

      {/* Image Previews Grid */}
      {validImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {validImages.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group"
            >
              <img
                src={url}
                alt={`Property photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-2 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-lg"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {idx === 0 && (
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                  Cover Photo
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
