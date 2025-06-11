import { NextResponse } from 'next/server';
import { TagService } from '@/lib/api/services/blog/tag.service';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { TagsResponse } from '@/lib/api/types/blog';

// Cache duration in seconds (1 hour)
const CACHE_DURATION = 3600;

export async function GET() {
  try {
    const tagService = TagService.getInstance();
    const tags = await tagService.getTags();

    const response: TagsResponse = {
      data: tags,
    };

    // Create response with cache headers
    return new NextResponse(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
} 