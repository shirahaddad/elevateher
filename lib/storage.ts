import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getS3Url } from '@/lib/s3Utils';

type UploadResult = { url: string; pathname: string };

const isServer = typeof window === 'undefined';
const s3Client = isServer
  ? new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    })
  : null;

export async function uploadPublicBlob(
  blobPath: string,
  data: ArrayBuffer | Buffer | Uint8Array,
  contentType: string
): Promise<UploadResult> {
  if (!isServer) {
    throw new Error('uploadPublicBlob can only be called on the server');
  }
  const bucket = process.env.AWS_BUCKET_NAME;
  if (!bucket) {
    throw new Error('Missing AWS_BUCKET_NAME environment variable');
  }
  if (!s3Client) {
    throw new Error('S3 client is not available');
  }

  const key = blobPath.replace(/^\/+/, '');
  const body =
    data instanceof Buffer
      ? data
      : data instanceof Uint8Array
      ? data
      : Buffer.from(data as ArrayBuffer);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: 'public-read',
  });
  await s3Client.send(command);
  const url = await getS3Url(key);
  return { url, pathname: key };
}


