import { NextResponse } from 'next/server';

export async function GET() {
  const svgPlaceholder = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="none">
    <rect width="800" height="600" fill="#0f172a"/>
    <rect x="20" y="20" width="760" height="560" rx="16" stroke="#00884C" stroke-width="2" stroke-dasharray="6 6" fill="#1e293b"/>
    <path d="M360 260L400 220L440 260M400 220V340" stroke="#00884C" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="400" y="400" text-anchor="middle" fill="#00884C" font-family="sans-serif" font-size="20" font-weight="bold">Remy Real Estate</text>
    <text x="400" y="435" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="14">Property Photo</text>
  </svg>`;

  return new NextResponse(svgPlaceholder, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
