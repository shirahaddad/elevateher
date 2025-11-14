import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .select('value')
      .eq('key', 'slack_invite_link')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error reading slack_invite_link:', error);
      return NextResponse.json({ error: 'Failed to read setting' }, { status: 500 });
    }

    return NextResponse.json({ value: data?.value ?? '' });
  } catch (error) {
    console.error('GET /admin/settings/slack-invite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { value } = (await request.json()) as { value: string };
    if (typeof value !== 'string') {
      return NextResponse.json({ error: 'Invalid value' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('app_settings')
      .upsert({ key: 'slack_invite_link', value }, { onConflict: 'key' });

    if (error) {
      console.error('Error upserting slack_invite_link:', error);
      return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /admin/settings/slack-invite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


