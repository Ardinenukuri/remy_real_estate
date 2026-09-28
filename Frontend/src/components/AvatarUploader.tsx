'use client';

import React, { useState } from 'react';
import { Camera, Loader2, User } from 'lucide-react';

interface AvatarUploaderProps {
  currentUrl?: string;
  onAvatarChange: (newUrl: string) => void;
  name?: string;
}

export function AvatarUploader({ currentUrl, onAvatarChange, name = 'User' }: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // FileReader base64 preview & server upload
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        onAvatarChange(base64Url);
        setUploading(false);
      };
      reader.readAsDataURL(file);

      // Also try uploading to server upload route
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/realtor/upload', {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          onAvatarChange(data.url);
        }
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group w-24 h-24 mx-auto">
      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-500/50 bg-slate-950 flex items-center justify-center shadow-xl relative">
        {currentUrl ? (
          <img src={currentUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-emerald-400 font-bold text-2xl">
            {name ? name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-emerald-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}
      </div>

      <label
        className="absolute bottom-0 right-0 p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110 border-2 border-slate-900"
        title="Upload Profile Photo"
      >
        <Camera className="w-3.5 h-3.5" />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
