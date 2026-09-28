import { NextRequest, NextResponse } from 'next/server';
// Never cache this route - always proxy through to the backend for live data.
export const dynamic = 'force-dynamic';

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

    if (typeof body.is_banned !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid payload: is_banned boolean field is required' },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(`${API_BASE_URL}/users/${id}/ban`, {
      method: 'PATCH',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_banned: body.is_banned }),
    });

    const data = await backendResponse.json().catch(() => null);

    return NextResponse.json(data ?? { message: 'Ban response received' }, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('Error in PATCH /api/users/[id]/ban:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
