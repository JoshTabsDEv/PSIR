import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';

// GET /api/auth/me - current signed-in user
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ success: true, data: session });
}
