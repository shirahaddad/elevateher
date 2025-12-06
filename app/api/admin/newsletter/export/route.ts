import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data, error } = await supabaseAdmin
      .from('mailing_list_subscribers')
      .select('email,name,public_id,status')
      .order('email', { ascending: true });
    if (error) {
      console.error('Export error:', error);
      return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
    }
    const rows = [['email','name','public_id','status'], ...(data || []).map(r => [r.email, r.name || '', r.public_id, r.status])];
    const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="newsletter_subscribers.csv"',
      },
    } as any);
  } catch (error) {
    console.error('GET /admin/newsletter/export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



