import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params?.slug;
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }
    const { data, error } = await supabaseAdmin
      .from('newsletter_archive')
      .select('subject,slug,published_at,html_sanitized')
      .eq('slug', slug)
      .eq('is_public', true)
      .maybeSingle();
    if (error) {
      console.error('Public archive detail error:', error);
      return NextResponse.json({ error: 'Failed to load entry' }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({
      subject: data.subject,
      slug: data.slug,
      published_at: data.published_at,
      html: data.html_sanitized,
    });
  } catch (error) {
    console.error('GET /api/newsletter/archive/[slug] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

