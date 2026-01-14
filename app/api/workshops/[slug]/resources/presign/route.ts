import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type SlugParams = { slug: string };

const isServer = typeof window === 'undefined';
const s3 = isServer
  ? new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    })
  : null;

export async function POST(request: Request, context: { params: Promise<SlugParams> }) {
  try {
    const { slug } = await context.params;
    const body = await request.json();
    const resourceId = Number(body?.resourceId);
    if (!slug || !resourceId || Number.isNaN(resourceId)) {
      return NextResponse.json({ error: 'Missing slug or resourceId' }, { status: 400 });
    }
    if (!s3) throw new Error('S3 not available');

    // Find workshop by slug
    const { data: workshop, error: wErr } = await supabaseAdmin
      .from('workshops')
      .select('id')
      .eq('slug', slug)
      .single();
    if (wErr || !workshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    // Verify resource belongs to this workshop
    const { data: resource, error: rErr } = await supabaseAdmin
      .from('workshop_resources')
      .select('s3_key')
      .eq('id', resourceId)
      .eq('workshop_id', workshop.id)
      .single();
    if (rErr || !resource || !resource.s3_key) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const cmd = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: resource.s3_key as string,
    });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 60 * 5 });
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Public presign error:', error);
    return NextResponse.json({ error: 'Failed to generate URL' }, { status: 500 });
  }
}

export async function GET(request: Request, context: { params: Promise<SlugParams> }) {
  try {
    const { slug } = await context.params;
    // Admins bypass, others must have cookie set by verify endpoint
    const session = await getServerSession(authOptions);
    if (!session) {
      const cookieStore = cookies();
      const gate = cookieStore.get(`workshop_res_${slug}`)?.value;
      if (gate !== '1') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    const urlObj = new URL(request.url);
    const resourceIdParam = urlObj.searchParams.get('resourceId');
    const resourceId = Number(resourceIdParam);
    if (!slug || !resourceId || Number.isNaN(resourceId)) {
      return NextResponse.json({ error: 'Missing slug or resourceId' }, { status: 400 });
    }
    if (!s3) throw new Error('S3 not available');

    const { data: workshop } = await supabaseAdmin
      .from('workshops')
      .select('id')
      .eq('slug', slug)
      .single();
    if (!workshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    const { data: resource } = await supabaseAdmin
      .from('workshop_resources')
      .select('s3_key')
      .eq('id', resourceId)
      .eq('workshop_id', workshop.id)
      .single();
    if (!resource || !resource.s3_key) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Derive a friendly filename from the key
    const key = resource.s3_key as string;
    const fallbackName = key.split('/').pop() || 'download';
    const cmd = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${fallbackName}"`,
    });
    const signed = await getSignedUrl(s3, cmd, { expiresIn: 60 * 5 });
    return NextResponse.redirect(signed, { status: 302 });
  } catch (error) {
    console.error('Public presign GET error:', error);
    return NextResponse.json({ error: 'Failed to generate URL' }, { status: 500 });
  }
}

