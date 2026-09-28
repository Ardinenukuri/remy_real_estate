import { NextRequest, NextResponse } from 'next/server';
// Never cache this route - always proxy through to the backend for live data.
export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const backendHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) backendHeaders.Authorization = authHeader;

    const backendResponse = await fetch(`${API_BASE_URL}/realtor/categories`, {
      method: 'GET',
      headers: backendHeaders,
    });

    const data = await backendResponse.json().catch(() => null);
    return NextResponse.json(data ?? [], { status: backendResponse.status });
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
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

    const backendResponse = await fetch(`${API_BASE_URL}/realtor/categories`, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json().catch(() => null);
    return NextResponse.json(data ?? { message: 'Category created' }, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('Error in POST /api/categories:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}