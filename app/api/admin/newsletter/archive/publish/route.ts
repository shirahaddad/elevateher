import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeForPublic, slugifyFromSubject } from '@/lib/newsletterArchive';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type PublishBody = {
  campaignId: number;
  slug?: string;
};

async function ensureUniqueSlug(baseSlug: string, campaignId: number): Promise<string> {
  const base = baseSlug || 'newsletter';
  let candidate = base;
  // Try base, then numeric suffixes (no timestamp)
  for (let i = 0; i <= 200; i++) {
    const { data, error } = await supabaseAdmin
      .from('newsletter_archive')
      .select('id,campaign_id')
      .eq('slug', candidate)
      .maybeSingle();
    if (error) throw error;
    if (!data || data.campaign_id === campaignId) {
      return candidate;
    }
    // Next candidate with numeric suffix (starts at -1)
    const suffix = i + 1;
    candidate = `${base}-${suffix}`;
  }
  // Final random numeric suffix (still no timestamp)
  const rand = Math.floor(Math.random() * 10000);
  return `${base}-${rand}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = (await request.json()) as PublishBody;
    if (!body?.campaignId || typeof body.campaignId !== 'number') {
      return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
    }
    // Load archive row
    const { data: archiveRow, error: aErr } = await supabaseAdmin
      .from('newsletter_archive')
      .select('id,campaign_id,subject,html_template,slug,is_public')
      .eq('campaign_id', body.campaignId)
      .maybeSingle();
    if (aErr) {
      console.error('Archive lookup error:', aErr);
      return NextResponse.json({ error: 'Archive row lookup failed' }, { status: 500 });
    }
    if (!archiveRow) {
      return NextResponse.json({ error: 'Archive row not found' }, { status: 404 });
    }
    const computedSlug = body.slug && body.slug.trim().length > 0
      ? body.slug.trim().toLowerCase()
      : slugifyFromSubject(archiveRow.subject || '');
    const uniqueSlug = await ensureUniqueSlug(computedSlug, body.campaignId);
    const sanitized = sanitizeForPublic(archiveRow.html_template || '');
    const { error: upErr } = await supabaseAdmin
      .from('newsletter_archive')
      .update({
        html_sanitized: sanitized,
        slug: uniqueSlug,
        is_public: true,
        published_at: new Date().toISOString(),
      })
      .eq('campaign_id', body.campaignId);
    if (upErr) {
      console.error('Archive publish update error:', upErr);
      return NextResponse.json({ error: 'Failed to publish' }, { status: 500 });
    }
    return NextResponse.json({ success: true, url: `/newsletter/${uniqueSlug}`, slug: uniqueSlug });
  } catch (error) {
    console.error('POST /api/admin/newsletter/archive/publish error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

