import { S3Client, PutObjectCommand, CopyObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Only check environment variables on the server side
const isServer = typeof window === 'undefined';
if (isServer) {
  if (!process.env.AWS_REGION) throw new Error('AWS_REGION is required');
  if (!process.env.AWS_ACCESS_KEY_ID) throw new Error('AWS_ACCESS_KEY_ID is required');
  if (!process.env.AWS_SECRET_ACCESS_KEY) throw new Error('AWS_SECRET_ACCESS_KEY is required');
  if (!process.env.AWS_BUCKET_NAME) throw new Error('AWS_BUCKET_NAME is required');
}

// Initialize S3 client with environment variables
const s3Client = isServer ? new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
}) : null;

// Helper function to ensure we're on the server and get the S3 client
const getS3Client = (): S3Client => {
  if (!isServer) {
    throw new Error('This function can only be called on the server');
  }
  if (!s3Client) {
    throw new Error('S3 client is not initialized');
  }
  return s3Client;
};

/**
 * Uploads a file to S3 and returns the relative path
 * @param file - The file to upload
 * @param postId - The ID of the blog post
 * @returns The relative path to the uploaded file
 */
export const uploadToS3 = async (file: File, postId: string): Promise<string> => {
  const client = getS3Client();
  try {
    // Generate a unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const key = `blog/${postId}/${fileName}`;

    // Create the command to upload the file
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      ContentType: file.type,
      Body: new Uint8Array(await file.arrayBuffer()),
    });

    // Upload the file
    await client.send(command);

    // Return the relative path
    return key;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload image to S3');
  }
};

/**
 * Uploads a file to S3 temp folder
 * @param file - The file to upload
 * @returns The relative path in temp folder
 */
export const uploadToTempS3 = async (file: File): Promise<string> => {
  const client = getS3Client();
  try {
    // Get the original file extension from the mime type
    const mimeToExt: { [key: string]: string } = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp'
    };
    const ext = mimeToExt[file.type] || '.jpg';

    // Generate a unique filename with proper extension
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
    const key = `blog/temp/${fileName}`;

    // Create the command to upload the file
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      ContentType: file.type,
      Body: new Uint8Array(await file.arrayBuffer()),
    });

    // Upload the file
    await client.send(command);

    // Return the relative path
    return key;
  } catch (error) {
    console.error('Error uploading to S3 temp:', error);
    throw new Error('Failed to upload image to S3 temp folder');
  }
};

/**
 * Moves a file from temp to final location in S3
 * @param tempKey - The current key in temp folder
 * @param postId - The ID of the blog post
 * @returns The new path in the post folder
 */
export const moveS3File = async (tempKey: string, postId: string): Promise<string> => {
  const client = getS3Client();
  
  try {
    if (!tempKey || !postId) {
      throw new Error('tempKey and postId are required');
    }

    // Generate the new key in the post's folder
    const fileName = tempKey.split('/').pop();
    if (!fileName) {
      throw new Error('Invalid tempKey format');
    }
    const newKey = `blog/${postId}/${fileName}`;

    // Copy the object to the new location
    const copyCommand = new CopyObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      CopySource: `${process.env.AWS_BUCKET_NAME}/${tempKey}`,
      Key: newKey,
    });

    console.log('Moving S3 file:', {
      from: tempKey,
      to: newKey,
      bucket: process.env.AWS_BUCKET_NAME
    });

    await client.send(copyCommand);

    // Delete the temp file
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: tempKey,
    });
    await client.send(deleteCommand);

    return newKey;
  } catch (error) {
    console.error('Error moving S3 file:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to move image to final location: ${error.message}`);
    }
    throw new Error('Failed to move image to final location');
  }
};

/**
 * Deletes a file from S3
 * @param key - The key of the file to delete
 */
export const deleteS3File = async (key: string): Promise<void> => {
  const client = getS3Client();
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });
    await client.send(command);
  } catch (error) {
    console.error('Error deleting S3 file:', error);
    throw new Error('Failed to delete image from S3');
  }
};

/**
 * Gets the full URL for an S3 object
 * @param key - The key of the S3 object
 * @returns The full URL
 */
export const getS3Url = async (key: string): Promise<string> => {
  if (!key) return '';
  
  // If the key is already a full URL, return it as is
  if (key.startsWith('http')) {
    return key;
  }

  // If we're on the client side, construct the URL directly
  if (!isServer) {
    const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME || process.env.AWS_BUCKET_NAME || 'elevateher-blog-images';
    const region = process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION || 'us-east-1';
    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  }

  // On the server side, generate a pre-signed URL
  try {
    const client = getS3Client();
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });
    
    // Generate a pre-signed URL that expires in 1 hour
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return '';
  }
}; 