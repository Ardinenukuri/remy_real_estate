import { NextRequest, NextResponse } from 'next/server';

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

    const backendResponse = await fetch(`${API_BASE_URL}/customer/profile`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await backendResponse.json().catch(() => null);
    return NextResponse.json(data ?? { profile: {} }, { status: backendResponse.status });
  } catch (error) {
    console.error('Error in GET /api/customer/profile:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing authentication token' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const backendResponse = await fetch(`${API_BASE_URL}/customer/profile`, {
      method: 'PUT',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json().catch(() => null);
    return NextResponse.json(data ?? { message: 'Profile updated' }, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('Error in PUT /api/customer/profile:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}