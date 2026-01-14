import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

type SlugParams = { slug: string };

export async function POST(request: Request, context: { params: Promise<SlugParams> }) {
  try {
    const { slug } = await context.params;
    const body = await request.json();
    const passkey: string | undefined = body?.passkey;
    if (!slug || passkey === undefined) {
      return NextResponse.json({ error: 'Missing slug or passkey' }, { status: 400 });
    }
    const { data: workshop, error } = await supabaseAdmin
      .from('workshops')
      .select('id, resource_password_hash')
      .eq('slug', slug)
      .single();
    if (error || !workshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }
    // If no passkey set, allow
    if (!workshop.resource_password_hash) {
      const res = NextResponse.json({ ok: true });
      res.cookies.set(`workshop_res_${slug}`, '1', { path: `/api/workshops/${slug}/resources`, maxAge: 60 * 60 * 5 });
      return res;
    }
    if (passkey.trim() !== workshop.resource_password_hash) {
      return NextResponse.json({ error: 'Invalid passkey' }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(`workshop_res_${slug}`, '1', { path: `/api/workshops/${slug}/resources`, maxAge: 60 * 60 * 5 });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}

