export type PropertyType = 'house' | 'apartment' | 'condo' | 'villa' | 'land';
export type PropertyStatus = 'for_sale' | 'for_rent' | 'sold' | 'pending';
export type UserRole = 'customer' | 'realtor' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  createdAt: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'realtor' | 'admin';
  is_verified?: boolean;
  is_verified_realtor?: boolean;
  is_banned?: boolean;
  banned_at?: Date | string | null;
  phone?: string | null;
  company?: string | null;
  created_at?: Date | string | null;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type?: string;
  status?: string;
  location?: string;
  city?: string;
  district?: string;
  category?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqFt?: number;
  imageUrls?: string[];
  is_approved?: boolean;
  is_featured?: boolean;
  views?: number;
  created_at?: Date | string | number | null;
  realtor?: Profile | null;
  createdAt?: string;
}
