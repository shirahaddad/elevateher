import { NextResponse } from 'next/server';
import { uploadToTempS3, getS3Url } from '@/lib/s3Utils';
import { z } from 'zod';
import { fileUploadSchema } from '@/lib/validation/base';

export async function POST(request: Request) {
  console.log('Upload route - AWS Environment Variables:', {
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET_NAME,
    hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
    hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
  });

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Create a plain object with file properties for validation
    // This is necessary because the File object from the client
    // doesn't maintain its instance properties on the server side
    const fileData = {
      filename: file.name,
      mimetype: file.type,
      size: file.size
    };

    // Validate with Zod
    const validation = fileUploadSchema.safeParse(fileData);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      );
    }

    // Upload to S3 temp folder
    const key = await uploadToTempS3(file);
    const url = getS3Url(key);

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      key,
      url
    });

  } catch (error) {
    console.error('Error in upload route:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 