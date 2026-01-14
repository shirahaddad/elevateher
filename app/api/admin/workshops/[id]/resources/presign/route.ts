import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
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

export async function POST(request: Request, _context: { params: Promise<IdParams> }) {
  try {
    if (!s3) throw new Error('S3 not available');
    const body = await request.json();
    const s3_key: string | undefined = body?.s3_key;
    if (!s3_key) {
      return NextResponse.json({ error: 'Missing s3_key' }, { status: 400 });
    }
    const cmd = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: s3_key,
    });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 60 * 5 }); // 5 minutes
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Presign resource error:', error);
    return NextResponse.json({ error: 'Failed to generate URL' }, { status: 500 });
  }
}

