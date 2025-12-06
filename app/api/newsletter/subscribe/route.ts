import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, name, source } = await request.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    const normalized = (email as string).toLowerCase();
    const now = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from('mailing_list_subscribers')
      .upsert({
        email: normalized,
        name,
        status: 'subscribed',
        subscribed_at: now,
        last_source: source || 'community-join',
      }, { onConflict: 'email' });
    if (error) {
      console.error('Subscribe upsert error:', error);
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



