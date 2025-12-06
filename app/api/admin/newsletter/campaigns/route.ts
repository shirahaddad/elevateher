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
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 200);
    const { data, error } = await supabaseAdmin
      .from('newsletter_campaign_logs')
      .select('id,subject,campaign_key,total,success_count,error_count,sent_by,started_at,completed_at,created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.error('Campaigns list error:', error);
      return NextResponse.json({ error: 'Failed to load campaigns' }, { status: 500 });
    }
    return NextResponse.json({ campaigns: data || [] });
  } catch (error) {
    console.error('GET /api/admin/newsletter/campaigns error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


