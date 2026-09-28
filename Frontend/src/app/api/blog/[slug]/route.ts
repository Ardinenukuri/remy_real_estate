import { NextRequest, NextResponse } from 'next/server';
// Never cache this route - always proxy through to the backend for live data.
export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const backendResponse = await fetch(`${API_BASE_URL}/blog/${params.slug}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await backendResponse.json().catch(() => null);
    return NextResponse.json(data ?? { error: 'Article not found' }, { status: backendResponse.status });
  } catch (error) {
    console.error('Error in GET /api/blog/[slug]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
