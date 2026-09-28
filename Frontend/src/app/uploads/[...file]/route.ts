import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { file: string[] } }
) {
  try {
    const filename = params.file ? params.file.join('/') : '';
    const publicUploadsPath = path.join(process.cwd(), 'public', 'uploads', filename);

    // If file exists in public/uploads, serve it
    if (fs.existsSync(publicUploadsPath)) {
      const fileBuffer = fs.readFileSync(publicUploadsPath);
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'image/jpeg';
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      else if (ext === '.gif') contentType = 'image/gif';

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // High quality fallback SVG placeholder for uploaded images that are pending or missing
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="none">
      <rect width="800" height="600" fill="#0f172a"/>
      <rect x="20" y="20" width="760" height="560" rx="20" stroke="#00884C" stroke-width="2" stroke-dasharray="8 8" fill="#1e293b"/>
      <path d="M350 250L400 200L450 250M400 200V350" stroke="#00884C" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="400" y="420" text-anchor="middle" fill="#00884C" font-family="sans-serif" font-size="24" font-weight="bold">Remy Real Estate Property Photo</text>
      <text x="400" y="460" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="16">${filename || 'Uploaded Image'}</text>
    </svg>`;

    return new NextResponse(fallbackSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error serving upload:', error);
    return new NextResponse('Image not found', { status: 404 });
  }
}
