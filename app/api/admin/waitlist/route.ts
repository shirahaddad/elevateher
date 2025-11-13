import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category') || '';
    const excludeCategory = searchParams.get('exclude') || '';
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('waitlist')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category);
    }
    // Exclude a category if requested
    if (!category && excludeCategory) {
      query = query.neq('category', excludeCategory);
    }

    const { data, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('Error fetching waitlist entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist entries' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action, reason } = body as {
      id: string;
      action: 'approve' | 'reject' | 'delay';
      reason?: string;
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
      console.error('Error updating waitlist entry:', error);
      return NextResponse.json(
        { error: 'Failed to update waitlist entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error processing PATCH request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing waitlist entry ID' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('waitlist')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting waitlist entry:', error);
      return NextResponse.json(
        { error: 'Failed to delete waitlist entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 