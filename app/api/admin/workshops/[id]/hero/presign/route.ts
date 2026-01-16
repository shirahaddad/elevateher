import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

export async function POST(request: Request, context: { params: Promise<IdParams> }) {
  try {
    if (!s3) throw new Error('S3 not available');
    const { id: idParam } = await context.params;
    const workshopId = Number(idParam);
    if (!workshopId || Number.isNaN(workshopId)) {
      return NextResponse.json({ error: 'Missing workshop id' }, { status: 400 });
    }
    const body = await request.json().catch(() => ({}));
    const fileNameRaw: string = body?.fileName || '';
    const contentTypeRaw: string = body?.contentType || 'image/jpeg';
    const ext = (fileNameRaw.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const contentType = typeof contentTypeRaw === 'string' && contentTypeRaw ? contentTypeRaw : 'image/jpeg';
    const key = `workshops/${workshopId}/hero-${Date.now()}.${ext}`;

    const cmd = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read',
    });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 60 * 5 });
    // Client must include x-amz-acl: public-read when PUTting to this URL
    return NextResponse.json({
      url,
      s3_key: key,
      mime_type: contentType,
      requiredHeaders: { 'x-amz-acl': 'public-read' },
    });
  } catch (error) {
    console.error('Presign hero upload error:', error);
    return NextResponse.json({ error: 'Failed to presign hero upload' }, { status: 500 });
  }
}

