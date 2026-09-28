import { NextRequest, NextResponse } from 'next/server';
// Never cache this route - always proxy through to the backend for live data.
export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing authentication token' },
        { status: 401 }
      );
    }

    const backendResponse = await fetch(`${API_BASE_URL}/admin/properties/stats`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await backendResponse.json().catch(() => null);

    return NextResponse.json(data ?? { total: 0, approved: 0, pending: 0, featured: 0, totalViews: 0 }, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/properties/stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}