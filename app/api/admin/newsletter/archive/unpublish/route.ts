import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type UnpublishBody = {
  campaignId: number;
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = (await request.json()) as UnpublishBody;
    if (!body?.campaignId || typeof body.campaignId !== 'number') {
      return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
    }
    const { error } = await supabaseAdmin
      .from('newsletter_archive')
      .update({
        is_public: false,
      })
      .eq('campaign_id', body.campaignId);
    if (error) {
      console.error('Archive unpublish update error:', error);
      return NextResponse.json({ error: 'Failed to unpublish' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/admin/newsletter/archive/unpublish error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

