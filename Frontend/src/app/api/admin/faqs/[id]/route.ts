import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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

    const backendResponse = await fetch(`${API_BASE_URL}/admin/faqs/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json().catch(() => null);
    return NextResponse.json(data ?? { message: 'FAQ updated' }, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('Error in PATCH /api/admin/faqs/[id]:', error);
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

    const backendResponse = await fetch(`${API_BASE_URL}/admin/faqs/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await backendResponse.json().catch(() => null);
    return NextResponse.json(data ?? { deleted: true, id }, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/faqs/[id]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}