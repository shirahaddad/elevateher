import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { signUnsubscribeToken } from '@/lib/newsletterTokens';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = (searchParams.get('email') || '').toLowerCase().trim();
    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const token = signUnsubscribeToken(email, 'newsletter', 365);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/unsubscribe?token=${encodeURIComponent(token)}`;

    return NextResponse.json({ url, token, email });
  } catch (error) {
    console.error('Error generating unsubscribe link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



