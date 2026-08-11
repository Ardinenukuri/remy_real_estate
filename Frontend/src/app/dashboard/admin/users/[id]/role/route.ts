import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const VALID_ROLES = ['customer', 'realtor', 'admin'] as const;

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

    if (!body.role || !VALID_ROLES.includes(body.role)) {
      return NextResponse.json(
        { error: 'Invalid role provided' },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(`${API_BASE_URL}/users/${id}/role`, {
      method: 'PATCH',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: body.role }),
    });

    const data = await backendResponse.json().catch(() => null);

    return NextResponse.json(data ?? { message: 'Role update response received' }, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('Error in PATCH /api/users/[id]/role:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}