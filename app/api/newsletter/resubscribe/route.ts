import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyUnsubscribeToken } from '@/lib/newsletterTokens';

export async function POST(request: NextRequest) {
  try {
    const { token, id } = await request.json();
    const now = new Date().toISOString();
    if (id && typeof id === 'string') {
      const { error } = await supabaseAdmin
        .from('mailing_list_subscribers')
        .update({ status: 'subscribed', subscribed_at: now })
        .eq('public_id', id);
      if (error) {
        console.error('Resubscribe by id error:', error);
        return NextResponse.json({ error: 'Failed to resubscribe' }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Missing token or id' }, { status: 400 });
    }
    const { email } = verifyUnsubscribeToken(token);
    const { error } = await supabaseAdmin
      .from('mailing_list_subscribers')
      .upsert({
        email,
        status: 'subscribed',
        subscribed_at: now,
      }, { onConflict: 'email' });
    if (error) {
      console.error('Resubscribe upsert error:', error);
      return NextResponse.json({ error: 'Failed to resubscribe' }, { status: 500 });
    }
    return NextResponse.json({ success: true, email });
  } catch (err) {
    console.error('Resubscribe error:', err);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
}


