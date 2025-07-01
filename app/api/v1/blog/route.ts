import { NextResponse } from 'next/server';
import { BlogPostService } from '@/lib/api/services/blog/post.service';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { BlogPostsResponse, BlogPostResponse, CreateBlogPostInput, UpdateBlogPostInput } from '@/lib/api/types/blog';
import { blogSearchQuerySchema } from '@/lib/validation/base';

// Cache duration in seconds (1 minute)
const CACHE_DURATION = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const validation = blogSearchQuerySchema.safeParse(query);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        errors: validation.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
      }, { status: 400 });
    }
    const { tag, is_published, author, page, limit } = validation.data;

    const blogService = BlogPostService.getInstance();
    const result = await blogService.getPosts({
      tag: tag || undefined,
      is_published: is_published !== undefined ? (is_published === true || is_published === 'true') : undefined,
      author: author || undefined,
      page,
      limit,
    });

    const response: BlogPostsResponse = {
      data: result,
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

export async function POST(request: Request) {
  try {
    const body = await request.json() as CreateBlogPostInput;
    
    // Validate required fields
    const requiredFields = ['title', 'content', 'author_name'];
    const missingFields = requiredFields.filter(field => !body[field as keyof CreateBlogPostInput]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const blogService = BlogPostService.getInstance();
    const post = await blogService.createPost(body);

    const response: BlogPostResponse = {
      data: post,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as UpdateBlogPostInput;
    
    if (!body.id) {
      throw new Error('Post ID is required');
    }

    const blogService = BlogPostService.getInstance();
    const post = await blogService.updatePost(body);

    const response: BlogPostResponse = {
      data: post,
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new Error('Post ID is required');
    }

    const blogService = BlogPostService.getInstance();
    await blogService.deletePost(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
} 