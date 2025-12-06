import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyUnsubscribeToken } from '@/lib/newsletterTokens';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const token = searchParams.get('token');
    const test = searchParams.get('test');
    const now = new Date().toISOString();

    // Guard: if placeholder leaked through, do not mutate DB
    if (id && (id.includes('{{') || /%7B%7B/i.test(id) || /&#123;/i.test(id))) {
      const html = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Unsubscribe Link Invalid</title>
            <style>
              body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background:#fff; color:#111; padding: 2rem; }
              .card { max-width: 560px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 1.5rem; }
              .title { color: #6d28d9; font-weight: 700; font-size: 1.25rem; margin-bottom: .5rem; }
              .muted { color: #6b7280; font-size: .9rem; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="title">Unsubscribe Link Invalid</div>
              <p>This unsubscribe link contains a placeholder and cannot be processed. Please try again later or reply to the email for help.</p>
              <p class="muted">No changes were made to your subscription.</p>
            </div>
          </body>
        </html>
      `;
      return new NextResponse(html, { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } } as any);
    }

    // Test mode: do not mutate DB, return confirmation page
    if (test === '1' && (id || token)) {
      const html = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Unsubscribe (Test)</title>
            <style>
              body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background:#fff; color:#111; padding: 2rem; }
              .card { max-width: 560px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 1.5rem; }
              .title { color: #6d28d9; font-weight: 700; font-size: 1.25rem; margin-bottom: .5rem; }
              .muted { color: #6b7280; font-size: .9rem; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="title">Unsubscribe (Test Mode)</div>
              <p>This is a preview-only unsubscribe link. No changes were made to subscriber status.</p>
              <p class="muted">If this were a real email, clicking here would unsubscribe the recipient.</p>
            </div>
          </body>
        </html>
      `;
      return new NextResponse(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      } as any);
    }

    if (id) {
      // Unsubscribe by public_id
      const { data, error } = await supabaseAdmin
        .from('mailing_list_subscribers')
        .update({ status: 'unsubscribed', unsubscribed_at: now })
        .eq('public_id', id);
      if (error) {
        console.error('Unsubscribe by id error:', error);
        return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
      }
      const html = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Unsubscribed</title>
            <style>
              body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background:#fff; color:#111; padding: 2rem; }
              .card { max-width: 560px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 1.5rem; }
              .title { color: #6d28d9; font-weight: 700; font-size: 1.25rem; margin-bottom: .5rem; }
              .muted { color: #6b7280; font-size: .9rem; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="title">You're unsubscribed</div>
              <p>We've removed you from future emails. If this was a mistake, you can reply to the original message to re-subscribe.</p>
              <p class="muted">Thank you.</p>
            </div>
          </body>
        </html>
      `;
      return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } } as any);
    }
    if (!token) {
      return NextResponse.json({ error: 'Missing token or id' }, { status: 400 });
    }
    const { email } = verifyUnsubscribeToken(token);
    const { error } = await supabaseAdmin
      .from('mailing_list_subscribers')
      .upsert({
        email,
        status: 'unsubscribed',
        unsubscribed_at: now,
      }, { onConflict: 'email' });
    if (error) {
      console.error('Unsubscribe upsert error:', error);
      return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
    }
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Unsubscribed</title>
          <style>
            body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background:#fff; color:#111; padding: 2rem; }
            .card { max-width: 560px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 1.5rem; }
            .title { color: #6d28d9; font-weight: 700; font-size: 1.25rem; margin-bottom: .5rem; }
            .muted { color: #6b7280; font-size: .9rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">You're unsubscribed</div>
            <p>${email ? `We unsubscribed ${email}.` : 'You are unsubscribed.'}</p>
            <p class="muted">If this was a mistake, reply to the original email.</p>
          </div>
        </body>
      </html>
    `;
    return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } } as any);
  } catch (err) {
    console.error('Unsubscribe error:', err);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
}


