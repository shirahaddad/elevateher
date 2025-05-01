import { NextResponse } from 'next/server';
import { moveS3File } from '@/lib/s3Utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { tempKey, postId } = body;

    // Validate required fields
    if (!tempKey || typeof tempKey !== 'string') {
      return NextResponse.json(
        { error: 'tempKey is required and must be a string' },
        { status: 400 }
      );
    }

    if (!postId || typeof postId !== 'string') {
      return NextResponse.json(
        { error: 'postId is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate tempKey format
    if (!tempKey.startsWith('blog/temp/')) {
      return NextResponse.json(
        { error: 'Invalid tempKey format: must start with blog/temp/' },
        { status: 400 }
      );
    }

    // Move the file
    const finalImageKey = await moveS3File(tempKey, postId);

    // Validate the result
    if (!finalImageKey || typeof finalImageKey !== 'string') {
      return NextResponse.json(
        { error: 'Failed to get final image key' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageKey: finalImageKey
    });
  } catch (error) {
    console.error('Error moving image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to move image' },
      { status: 500 }
    );
  }
} 