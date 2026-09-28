import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
// Never cache this route - always proxy through to the backend for live data.
export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');

    // Generate clean unique filename
    const ext = path.extname(file.name) || '.jpeg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;

    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save file to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    // Forward to NestJS backend if active
    try {
      if (authHeader) {
        await fetch(`${API_BASE_URL}/realtor/upload`, {
          method: 'POST',
          headers: { Authorization: authHeader },
          body: formData,
        }).catch(() => null);
      }
    } catch (e) {
      // Backend offline fallback
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
    });
  } catch (error) {
    console.error('Error in POST /api/realtor/upload:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}