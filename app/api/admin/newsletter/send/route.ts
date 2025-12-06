import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SendBody = {
  html: string;
  text?: string;
  subject: string;
  from?: string;
  campaignKey?: string; // client-provided idempotency key
  limit?: number; // optional safety cap
};

function substitute(template: string, values: { firstName: string; publicID: string; unsubscribeUrl?: string }): string {
  let out = template;
  // Text tokens
  out = out.replace(/\{\{\s*firstName\s*\}\}/gi, values.firstName);
  out = out.replace(/\{\{\s*publicID\s*\}\}/gi, values.publicID);
  out = out.replace(/\{\{\s*public_id\s*\}\}/gi, values.publicID);
  // URL-encoded tokens inside hrefs
  out = out.replace(/%7B%7BpublicID%7D%7D/gi, values.publicID);
  out = out.replace(/%7B%7Bpublic_id%7D%7D/gi, values.publicID);
  if (values.unsubscribeUrl) {
    out = out.replace(/\{\{\s*unsubscribeUrl\s*\}\}/gi, values.unsubscribeUrl);
  }
  return out;
}

async function insertCampaignStart(subject: string, total: number, campaign_key: string | undefined, sent_by: string | undefined) {
  const { data, error } = await supabaseAdmin
    .from('newsletter_campaign_logs')
    .insert({
      subject,
      total,
      campaign_key: campaign_key || null,
      success_count: 0,
      error_count: 0,
      sent_by: sent_by || null,
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  if (error) throw error;
  return data?.id as number;
}

async function updateCampaignFinish(id: number, success: number, failed: number) {
  const { error } = await supabaseAdmin
    .from('newsletter_campaign_logs')
    .update({
      success_count: success,
      error_count: failed,
      completed_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = (await request.json()) as SendBody;
    if (!body?.html || !body?.subject) {
      return NextResponse.json({ error: 'Missing html or subject' }, { status: 400 });
    }
    const from = body.from || 'Elevate(Her) <info@elevateher.tech>';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: 'Missing RESEND_API_KEY' }, { status: 500 });
    }
    const resend = new Resend(resendKey);

    // Load recipients
    const limit = Math.max(0, Math.min(body.limit ?? 5000, 20000));
    const { data: recipients, error: rErr } = await supabaseAdmin
      .from('mailing_list_subscribers')
      .select('email,name,public_id')
      .eq('status', 'subscribed')
      .order('email', { ascending: true })
      .limit(limit > 0 ? limit : 5000);
    if (rErr) {
      console.error('Recipients query error:', rErr);
      return NextResponse.json({ error: 'Failed to query recipients' }, { status: 500 });
    }
    let list = recipients || [];
    // Basic email validation and cleanup
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalids: Array<{ email: string; error: string }> = [];
    list = list.filter((r) => {
      const email = (r.email || '').trim();
      const ok = emailRegex.test(email);
      if (!ok) invalids.push({ email: r.email || '(empty)', error: 'invalid email' });
      return ok;
    });
    const total = list.length + invalids.length;
    if (total === 0) {
      return NextResponse.json({ success: true, total: 0, sent: 0, failed: 0, errors: [] });
    }

    // Create campaign record
    let campaignId: number | null = null;
    try {
      campaignId = await insertCampaignStart(body.subject, total, body.campaignKey, session.user.email || undefined);
    } catch (e) {
      console.warn('Campaign start log failed (will continue sending):', (e as any)?.message || e);
    }

    // Send sequentially with throttling to respect provider limits (e.g., 2 rps)
    const batchSize = 25;
    const requestsPerSecond = 2; // adjust if your plan allows more
    const perSendDelayMs = Math.ceil(1000 / requestsPerSecond) + 50; // small cushion
    let sent = 0;
    const errors: Array<{ email: string; error: string }> = [...invalids];

    for (let i = 0; i < list.length; i += batchSize) {
      const batch = list.slice(i, i + batchSize);
      for (const rec of batch) {
        const firstName = (rec.name?.trim()?.split(/\s+/)[0]) || rec.email.split('@')[0];
        const unsubscribeUrl = `${appUrl.replace(/\/+$/, '')}/api/newsletter/unsubscribe?id=${encodeURIComponent(rec.public_id)}`;
        const html = substitute(body.html, { firstName, publicID: rec.public_id, unsubscribeUrl });
        const text = body.text ? substitute(body.text, { firstName, publicID: rec.public_id, unsubscribeUrl }) : undefined;
        try {
          const { error } = await resend.emails.send({
            from,
            to: rec.email,
            subject: body.subject,
            html,
            text,
          } as any);
          if (error) {
            errors.push({ email: rec.email, error: error.message || 'send error' });
          } else {
            sent++;
          }
        } catch (e: any) {
          const msg = e?.message || 'send exception';
          // Basic 429 backoff: wait and retry once
          if (/too many requests|rate limit/i.test(msg)) {
            await new Promise((res) => setTimeout(res, perSendDelayMs * 2));
            try {
              const { error } = await resend.emails.send({
                from,
                to: rec.email,
                subject: body.subject,
                html,
                text,
              } as any);
              if (error) {
                errors.push({ email: rec.email, error: `retry: ${error.message || msg}` });
              } else {
                sent++;
              }
            } catch (e2: any) {
              errors.push({ email: rec.email, error: `retry: ${e2?.message || msg}` });
            }
          } else {
            errors.push({ email: rec.email, error: msg });
          }
        }
        // Throttle between individual sends
        await new Promise((res) => setTimeout(res, perSendDelayMs));
      }
      // No additional batch delay needed since we throttle per send
    }

    if (campaignId) {
      try {
        await updateCampaignFinish(campaignId, sent, errors.length);
      } catch (e) {
        console.warn('Campaign finish log failed:', (e as any)?.message || e);
      }
    }

    // Trim error details to max 100 for payload size
    const errorSample = errors.slice(0, 100);
    return NextResponse.json({
      success: true,
      total,
      sent,
      failed: errors.length,
      errors: errorSample,
    });
  } catch (error) {
    console.error('POST /api/admin/newsletter/send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


