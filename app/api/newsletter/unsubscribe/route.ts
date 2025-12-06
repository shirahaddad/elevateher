import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyUnsubscribeToken } from '@/lib/newsletterTokens';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const token = searchParams.get('token');
    const now = new Date().toISOString();

    if (id) {
      // Unsubscribe by public_id
      const { data, error } = await (await import('@/lib/supabase')).supabaseAdmin
        .from('mailing_list_subscribers')
        .update({ status: 'unsubscribed', unsubscribed_at: now })
        .eq('public_id', id);
      if (error) {
        console.error('Unsubscribe by id error:', error);
        return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
      }
      return NextResponse.json({ success: true });
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
    return NextResponse.json({ success: true, email });
  } catch (err) {
    console.error('Unsubscribe error:', err);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
}


