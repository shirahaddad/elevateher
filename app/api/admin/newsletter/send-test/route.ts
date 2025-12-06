import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SendTestBody = {
  html: string;
  text?: string;
  subject: string;
  subscriberId: string;
  from?: string;
};

function substituteTokens(
  template: string,
  values: { firstName: string; publicID: string; unsubscribeUrl?: string }
): string {
  let out = template;
  // Text tokens
  out = out.replace(/\{\{\s*firstName\s*\}\}/gi, values.firstName);
  out = out.replace(/\{\{\s*publicID\s*\}\}/gi, values.publicID);
  out = out.replace(/\{\{\s*public_id\s*\}\}/gi, values.publicID);
  // URL-encoded tokens inside hrefs
  out = out.replace(/%7B%7BpublicID%7D%7D/gi, values.publicID);
  out = out.replace(/%7B%7Bpublic_id%7D%7D/gi, values.publicID);
  // Back-compat
  if (values.unsubscribeUrl) {
    out = out.replace(/\{\{\s*unsubscribeUrl\s*\}\}/gi, values.unsubscribeUrl);
  }
  return out;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = (await request.json()) as SendTestBody;
    if (!body?.html || !body?.subject || !body?.subscriberId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const { data: subscriber, error: sErr } = await supabaseAdmin
      .from('mailing_list_subscribers')
      .select('email,name,public_id,status')
      .eq('public_id', body.subscriberId)
      .maybeSingle();
    if (sErr || !subscriber) {
      console.error('Subscriber lookup error:', sErr);
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }
    const firstName = (subscriber.name?.trim()?.split(/\s+/)[0]) || (subscriber.email.split('@')[0]);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const unsubscribeUrl = `${appUrl.replace(/\/+$/, '')}/api/newsletter/unsubscribe?id=${encodeURIComponent(subscriber.public_id)}&test=1`;
    const compiledHtml = substituteTokens(body.html, { firstName, publicID: subscriber.public_id, unsubscribeUrl });
    const compiledText = body.text ? substituteTokens(body.text, { firstName, publicID: subscriber.public_id, unsubscribeUrl }) : undefined;

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: 'Missing RESEND_API_KEY' }, { status: 500 });
    }
    const resend = new Resend(resendKey);
    const from = body.from || 'Elevate(Her) <info@elevateher.tech>';
    const { error: sendError } = await resend.emails.send({
      from,
      to: subscriber.email,
      subject: body.subject,
      html: compiledHtml,
      text: compiledText,
    } as any);
    if (sendError) {
      console.error('Resend send error:', sendError);
      return NextResponse.json({ error: 'Failed to send test' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/admin/newsletter/send-test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


