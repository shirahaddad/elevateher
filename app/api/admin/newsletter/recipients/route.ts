import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'subscribed';
    const { count, error } = await supabaseAdmin
      .from('mailing_list_subscribers')
      .select('email', { count: 'exact', head: true })
      .eq('status', status);
    if (error) {
      console.error('Recipients count error:', error);
      return NextResponse.json({ error: 'Failed to fetch count' }, { status: 500 });
    }
    return NextResponse.json({ count: count ?? 0, status });
  } catch (error) {
    console.error('GET /api/admin/newsletter/recipients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


