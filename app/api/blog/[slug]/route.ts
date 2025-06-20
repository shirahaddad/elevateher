import { NextResponse } from 'next/server';
import { BlogPostService } from '@/lib/api/services/blog/post.service';
import { handleApiError } from '@/lib/api/utils/error-handler';

// Cache duration in seconds (1 hour)
const CACHE_DURATION = 3600;

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    const blogService = BlogPostService.getInstance();
    const post = await blogService.getPostBySlug(slug);

    // Create response with cache headers
    return new NextResponse(JSON.stringify({
      post
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
      },
    });

  } catch (error) {
    return handleApiError(error);
  }
} 