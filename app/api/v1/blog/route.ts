import { NextResponse } from 'next/server';
import { BlogPostService } from '@/lib/api/services/blog/post.service';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { BlogPostsResponse, BlogPostResponse, CreateBlogPostInput, UpdateBlogPostInput } from '@/lib/api/types/blog';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const isPublished = searchParams.get('is_published');

    const blogService = BlogPostService.getInstance();
    const posts = await blogService.getPosts({
      tag: tag || undefined,
      is_published: isPublished ? isPublished === 'true' : undefined,
    });

    const response: BlogPostsResponse = {
      data: {
        data: posts,
        total: posts.length,
        page: 1,
        limit: posts.length,
        totalPages: 1,
      },
    };

    return NextResponse.json(response);
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