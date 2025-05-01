import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Uploads a file to S3 and returns the relative path
 * @param file - The file to upload
 * @param postId - The ID of the blog post
 * @returns The relative path to the uploaded file
 */
export const uploadToS3 = async (file: File, postId: string): Promise<string> => {
  try {
    // Generate a unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const key = `blog/${postId}/${fileName}`;

    // Create the command to upload the file
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: file.type,
      Body: new Uint8Array(await file.arrayBuffer()),
    });

    // Upload the file
    await s3Client.send(command);

    // Return the relative path
    return key;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload image to S3');
  }
}; 