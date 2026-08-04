export type PropertyType = 'house' | 'apartment' | 'condo' | 'villa' | 'land';
export type PropertyStatus = 'for_sale' | 'for_rent' | 'sold' | 'pending';
export type UserRole = 'buyer' | 'agent' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: PropertyType;
  status: PropertyStatus;
  location: string;
  city?: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt?: number;
  imageUrls?: string[];
  owner?: User;
  createdAt: string;
}
