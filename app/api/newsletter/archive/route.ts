import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10) || 20, 100);
    const { data, error } = await supabaseAdmin
      .from('newsletter_archive')
      .select('subject,slug,published_at')
      .eq('is_public', true)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(limit);
    if (error) {
      console.error('Public archive list error:', error);
      return NextResponse.json({ error: 'Failed to load archive' }, { status: 500 });
    }
    return NextResponse.json({ items: data || [] });
  } catch (error) {
    console.error('GET /api/newsletter/archive error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

