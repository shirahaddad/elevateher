import { NextResponse } from 'next/server';

// Deprecated endpoint: the NEXT workshop is now fetched server-side
// by /services/workshops. Keep this stub to avoid build-time type errors.
export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Use /services/workshops instead.' },
    { status: 410 }
  );
}