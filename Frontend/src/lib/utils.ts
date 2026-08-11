import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Standard Tailwind class merger combining clsx and tailwind-merge
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Format numbers to USD currency without decimals
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Convert ISO date strings or Timestamps into relative time strings
export function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// Format large numbers to short form (e.g. 1.2M, 850K, 12.5K)
export function formatPriceShort(price: number, currency?: string): string {
  const symbol = currency === 'RWF' ? 'RWF ' : '$';
  if (price >= 1_000_000) {
    return `${symbol}${(price / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (price >= 1_000) {
    return `${symbol}${(price / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `${symbol}${price.toLocaleString()}`;
}
