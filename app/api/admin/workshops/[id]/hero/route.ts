import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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
    const { id: idParam } = await context.params;
    const workshopId = Number(idParam);
    if (!workshopId || Number.isNaN(workshopId)) {
      return NextResponse.json({ error: 'Missing workshop id' }, { status: 400 });
    }
    if (!s3) throw new Error('S3 not available');
    const form = await request.formData();
    const file = form.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const safeExt = ext.replace(/[^a-z0-9]/g, '') || 'jpg';
    const fileName = `hero-${Date.now()}.${safeExt}`;
    const key = `workshops/${workshopId}/${fileName}`;
    const arrayBuffer = await file.arrayBuffer();
    const put = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: Buffer.from(arrayBuffer),
      ContentType: file.type || 'image/jpeg',
      ACL: 'public-read',
    });
    await s3.send(put);
    return NextResponse.json({ s3_key: key, mime_type: file.type || 'image/jpeg' });
  } catch (error) {
    console.error('Upload hero error:', error);
    return NextResponse.json({ error: 'Failed to upload hero image' }, { status: 500 });
  }
}

