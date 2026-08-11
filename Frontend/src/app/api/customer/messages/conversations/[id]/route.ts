import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(
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

    const backendResponse = await fetch(`${API_BASE_URL}/customer/messages/conversations/${id}`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await backendResponse.json().catch(() => null);
    return NextResponse.json(data ?? { messages: [] }, { status: backendResponse.status });
  } catch (error) {
    console.error('Error in GET /api/customer/messages/conversations/[id]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const backendResponse = await fetch(`${API_BASE_URL}/customer/messages/conversations/${id}`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: body.content }),
    });

    const data = await backendResponse.json().catch(() => null);
    return NextResponse.json(data ?? { message: 'Message sent' }, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('Error in POST /api/customer/messages/conversations/[id]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}