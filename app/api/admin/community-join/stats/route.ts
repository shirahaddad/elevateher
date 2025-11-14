import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function countBy(filters: Record<string, any>) {
  let query = supabaseAdmin
    .from('waitlist')
    .select('id', { count: 'exact' })
    .eq('category', 'community-test');

  for (const [k, v] of Object.entries(filters)) {
    if (k === 'gte_created_at') {
      query = query.gte('created_at', v as string);
    } else {
      query = query.eq(k, v);
    }
  }
  const { count, error } = await query;
  if (error) {
    console.error('Count error:', filters, error);
    return 0;
  }
  return count || 0;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [total, pending, approved, rejected, delayed, last7Total] = await Promise.all([
      countBy({}),
      countBy({ status: 'pending' }),
      countBy({ status: 'approved' }),
      countBy({ status: 'rejected' }),
      countBy({ status: 'delayed' }),
      countBy({ gte_created_at: since }),
    ]);
    return NextResponse.json({
      total,
      pending,
      approved,
      rejected,
      delayed,
      last7Total,
      since,
    });
  } catch (error) {
    console.error('GET /admin/community-join/stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


