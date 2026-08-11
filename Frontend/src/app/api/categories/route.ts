import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
  try {
    const backendResponse = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const body = await request.json();

    const backendResponse = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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