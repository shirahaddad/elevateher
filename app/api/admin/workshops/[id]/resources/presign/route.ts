import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { supabaseAdmin } from '@/lib/supabase';

type IdParams = { id: string };

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

export async function POST(request: Request, _context: { params: Promise<IdParams> }) {
  try {
    if (!s3) throw new Error('S3 not available');
    const body = await request.json();
    const s3_key: string | undefined = body?.s3_key;
    if (!s3_key) {
      return NextResponse.json({ error: 'Missing s3_key' }, { status: 400 });
    }
    const fallbackName = s3_key.split('/').pop() || 'download';
    const cmd = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: s3_key,
      ResponseContentDisposition: `attachment; filename="${fallbackName}"`,
    });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 60 * 5 }); // 5 minutes
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Presign resource error:', error);
    return NextResponse.json({ error: 'Failed to generate URL' }, { status: 500 });
  }
}

export async function GET(request: Request, context: { params: Promise<IdParams> }) {
  try {
    if (!s3) throw new Error('S3 not available');
    const { id: idParam } = await context.params;
    const workshopId = Number(idParam);
    const urlObj = new URL(request.url);
    const resourceIdParam = urlObj.searchParams.get('resourceId');
    const resourceId = Number(resourceIdParam);
    if (!workshopId || Number.isNaN(workshopId) || !resourceId || Number.isNaN(resourceId)) {
      return NextResponse.json({ error: 'Missing ids' }, { status: 400 });
    }
    const { data: resource } = await supabaseAdmin
      .from('workshop_resources')
      .select('s3_key, name, workshop_id')
      .eq('id', resourceId)
      .eq('workshop_id', workshopId)
      .single();
    if (!resource?.s3_key) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    const fallbackName =
      (resource.name && `${resource.name}`.replace(/\s+/g, '_')) ||
      resource.s3_key.split('/').pop() ||
      'download';
    const cmd = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: resource.s3_key as string,
      ResponseContentDisposition: `attachment; filename="${fallbackName}"`,
    });
    const signed = await getSignedUrl(s3, cmd, { expiresIn: 60 * 5 });
    return NextResponse.redirect(signed, { status: 302 });
  } catch (error) {
    console.error('Admin presign GET error:', error);
    return NextResponse.json({ error: 'Failed to generate URL' }, { status: 500 });
  }
}
