import { S3Client, PutObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

/**
 * Uploads a file to S3 temp folder
 * @param file - The file to upload
 * @returns The relative path in temp folder
 */
export const uploadToTempS3 = async (file: File): Promise<string> => {
  try {
    // Generate a unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const key = `blog/temp/${fileName}`;

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
  try {
    // Generate the new key in the post's folder
    const fileName = tempKey.split('/').pop();
    const newKey = `blog/${postId}/${fileName}`;

    // Copy the object to the new location
    const copyCommand = new CopyObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      CopySource: `${process.env.AWS_BUCKET_NAME}/${tempKey}`,
      Key: newKey,
    });
    await s3Client.send(copyCommand);

    // Delete the temp file
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: tempKey,
    });
    await s3Client.send(deleteCommand);

    return newKey;
  } catch (error) {
    console.error('Error moving S3 file:', error);
    throw new Error('Failed to move image to final location');
  }
};

/**
 * Deletes a file from S3
 * @param key - The key of the file to delete
 */
export const deleteS3File = async (key: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
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
export const getS3Url = (key: string): string => {
  if (!key) return '';
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}; 