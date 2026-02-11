import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaignId = parseInt(params.id, 10);
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: 'Invalid campaign ID' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('newsletter_campaign_logs')
      .select('id,subject,campaign_key,total,success_count,error_count,sent_by,started_at,completed_at,created_at')
      .eq('id', campaignId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Get archive info if exists
    let archive = null;
    const { data: archiveData } = await supabaseAdmin
      .from('newsletter_archive')
      .select('is_public,slug,published_at')
      .eq('campaign_id', campaignId)
      .single();
    
    if (archiveData) {
      archive = {
        is_public: !!archiveData.is_public,
        slug: archiveData.slug || null,
        published_at: archiveData.published_at || null,
      };
    }

    // Determine status
    const status = data.completed_at ? 'completed' : 'in_progress';

    return NextResponse.json({
      campaign: {
        ...data,
        status,
        archive,
      },
    });
  } catch (error) {
    console.error('GET /api/admin/newsletter/campaigns/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
