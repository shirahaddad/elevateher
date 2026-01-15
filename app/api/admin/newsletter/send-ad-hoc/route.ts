import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = {
  html?: string;
  text?: string;
  subject?: string;
  recipients?: string | string[];
  from?: string;
};

function parseRecipients(input: Body['recipients']): string[] {
  if (Array.isArray(input)) {
    return input
      .map((s) => (typeof s === 'string' ? s : ''))
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }
  if (typeof input === 'string') {
    return input
      .split(/[,\s]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }
  return [];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = (await request.json().catch(() => ({}))) as Body;
    const subject = (body.subject || '').trim();
    const html = (body.html || '').toString();
    const text = body.text ? body.text.toString() : undefined;
    const recipients = parseRecipients(body.recipients);
    const from = body.from || 'Elevate(Her) <info@elevateher.tech>';

    if (!subject) {
      return NextResponse.json({ error: 'Missing subject' }, { status: 400 });
    }
    if (!html && !text) {
      return NextResponse.json({ error: 'Provide html or text' }, { status: 400 });
    }
    if (!recipients.length) {
      return NextResponse.json({ error: 'No recipients provided' }, { status: 400 });
    }
    if (recipients.length > 200) {
      return NextResponse.json({ error: 'Too many recipients (max 200)' }, { status: 400 });
    }

    const valid: string[] = [];
    const errors: Array<{ email: string; error: string }> = [];
    for (const r of recipients) {
      if (EMAIL_RE.test(r)) valid.push(r);
      else errors.push({ email: r, error: 'invalid email' });
    }
    if (valid.length === 0) {
      return NextResponse.json({
        success: true,
        total: recipients.length,
        sent: 0,
        failed: errors.length,
        errors,
      });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: 'Missing RESEND_API_KEY' }, { status: 500 });
    }
    const resend = new Resend(resendKey);

    let sent = 0;
    for (const email of valid) {
      try {
        const { error } = await resend.emails.send({
          from,
          to: email,
          subject,
          html: html || undefined,
          text,
        } as any);
        if (error) {
          errors.push({ email, error: error.message || 'send error' });
        } else {
          sent++;
        }
      } catch (e: any) {
        errors.push({ email, error: e?.message || 'send exception' });
      }
      // small throttle to be safe
      await new Promise((res) => setTimeout(res, 200));
    }

    return NextResponse.json({
      success: true,
      total: recipients.length,
      sent,
      failed: errors.length,
      errors: errors.slice(0, 100),
    });
  } catch (error) {
    console.error('POST /api/admin/newsletter/send-ad-hoc error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

