import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sendCommunityApprovalEmail, sendCommunityRejectionEmail } from '@/lib/email';
import { getSlackInviteLink } from '@/lib/settings';

// GET: list only community-test entries
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const query = supabaseAdmin
      .from('waitlist')
      .select('*', { count: 'exact' })
      .eq('category', 'community-test')
      .order('created_at', { ascending: false });

    const { data, error, count } = await query.range(offset, offset + limit - 1);
    if (error) throw error;

    return NextResponse.json({
      data,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('Error fetching community-test entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community-test entries' },
      { status: 500 }
    );
  }
}

// PATCH: approve/reject/delay for community-test entries only
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action, reason, slackInviteLink } = body as {
      id: string;
      action: 'approve' | 'reject' | 'delay';
      reason?: string;
      slackInviteLink?: string;
    };

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: id and action' },
        { status: 400 }
      );
    }
    if (action === 'reject' && !reason) {
      return NextResponse.json(
        { error: 'Reject action requires a reason' },
        { status: 400 }
      );
    }

    // Ensure the entry is in community-test category
    const { data: existing, error: readError } = await supabaseAdmin
      .from('waitlist')
      .select('*')
      .eq('id', id)
      .eq('category', 'community-test')
      .single();
    if (readError || !existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    let update: Record<string, any> = {
      reviewed_by_name: session.user.name || null,
      reviewed_by_email: session.user.email || null,
      reviewed_at: now,
      decision_reason: null,
    };

    switch (action) {
      case 'approve':
        update.status = 'approved';
        break;
      case 'reject':
        update.status = 'rejected';
        update.decision_reason = reason || null;
        break;
      case 'delay':
        update.status = 'delayed';
        break;
    }

    const { data, error } = await supabaseAdmin
      .from('waitlist')
      .update(update)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating community-test entry:', error);
      return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
    }

    // Notifications
    if (action === 'approve') {
      const resolvedLink = slackInviteLink || (await getSlackInviteLink());
      const result = await sendCommunityApprovalEmail({
        name: data.name,
        email: data.email,
        slackInviteLink: resolvedLink,
      });
      if (!result.success) {
        console.error('Failed to send approval email:', result.error);
      } else {
        await supabaseAdmin
          .from('waitlist')
          .update({ invite_link_sent_at: new Date().toISOString() })
          .eq('id', id);
      }
    } else if (action === 'reject') {
      if (existing.status === null || existing.status === 'pending' || existing.status === 'delayed') {
        const result = await sendCommunityRejectionEmail({
          name: data.name,
          email: data.email,
          reason: reason || 'Not specified',
        });
        if (!result.success) {
          console.error('Failed to send rejection email:', result.error);
        }
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error processing PATCH /admin/community-join:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


