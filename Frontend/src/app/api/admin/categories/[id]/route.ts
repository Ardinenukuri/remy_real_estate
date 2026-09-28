import { NextRequest, NextResponse } from 'next/server';
// Never cache this route - always proxy through to the backend for live data.
export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const backendResponse = await fetch(`${API_BASE_URL}/admin/categories/${params.id}`, {
      method: 'DELETE',
      headers: { Authorization: authHeader },
    });

    const data = await backendResponse.json().catch(() => null);
    return NextResponse.json(data ?? { error: 'Failed to delete category' }, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/categories/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
