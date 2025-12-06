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
    const q = searchParams.get('q')?.trim();
    const id = searchParams.get('id')?.trim();
    if (!q && !id) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }
    if (id) {
      const { data, error } = await supabaseAdmin
        .from('mailing_list_subscribers')
        .select('email,name,public_id,status')
        .eq('public_id', id)
        .maybeSingle();
      if (error) {
        console.error('Lookup by id error:', error);
        return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
      }
      return NextResponse.json({ results: data ? [data] : [] });
    }
    const { data, error } = await supabaseAdmin
      .from('mailing_list_subscribers')
      .select('email,name,public_id,status')
      .ilike('email', `%${q}%`)
      .order('email', { ascending: true })
      .limit(25);
    if (error) {
      console.error('Lookup by email error:', error);
      return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
    }
    return NextResponse.json({ results: data || [] });
  } catch (error) {
    console.error('GET /api/admin/newsletter/subscribers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


