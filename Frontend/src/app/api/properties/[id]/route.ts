import { NextRequest, NextResponse } from 'next/server';
// Never cache this route - always proxy through to the backend for live data.
export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const { id } = params;

    const backendHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) backendHeaders.Authorization = authHeader;

    const backendResponse = await fetch(`${API_BASE_URL}/realtor/properties/${id}`, {
      method: 'GET',
      headers: backendHeaders,
    });

    const data = await backendResponse.json().catch(() => null);
    return NextResponse.json(data ?? { error: 'Property not found' }, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('Error in GET /api/properties/[id]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing authentication token' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const backendResponse = await fetch(`${API_BASE_URL}/realtor/properties/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json().catch(() => null);
    return NextResponse.json(data ?? { error: 'Failed to update property' }, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('Error in PATCH /api/properties/[id]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing authentication token' },
        { status: 401 }
      );
    }

    const { id } = params;

    const backendResponse = await fetch(`${API_BASE_URL}/realtor/properties/${id}`, {
      method: 'DELETE',
      headers: { Authorization: authHeader },
    });

    const data = await backendResponse.json().catch(() => null);
    return NextResponse.json(data ?? { error: 'Failed to delete property' }, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('Error in DELETE /api/properties/[id]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
