import { NextRequest, NextResponse } from 'next/server';
// Never cache this route - always proxy through to the backend for live data.
export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();

    const backendResponse = await fetch(`${API_BASE_URL}/realtor/properties${query ? `?${query}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await backendResponse.json().catch(() => null);
    return NextResponse.json(data ?? [], { status: backendResponse.status });
  } catch (error) {
    console.error('Error in GET /api/properties:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();

    const backendHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) backendHeaders.Authorization = authHeader;

    const backendResponse = await fetch(`${API_BASE_URL}/realtor/properties`, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json().catch(() => null);
    return NextResponse.json(data ?? { message: 'Property created' }, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('Error in POST /api/properties:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}