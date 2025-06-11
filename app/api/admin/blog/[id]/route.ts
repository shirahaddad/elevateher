import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getS3Url, deleteS3File } from '@/lib/s3Utils';
import { createValidationMiddleware } from '@/lib/validation/middleware';
import { updateBlogPostSchema } from '@/lib/validation/base';
import { invalidateBlogPostCache, invalidateAllBlogCache } from '@/lib/api/utils/cache';

const validateUpdateBlogPost = createValidationMiddleware({ schema: updateBlogPostSchema });

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure we have a valid ID
    const { id: paramId } = params;
    const id = parseInt(paramId, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID format' },
        { status: 400 }
      );
    }

    // Fetch the post
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (postError) {
      console.error('Error fetching post:', postError);
      return NextResponse.json(
        { error: 'Failed to fetch post' },
        { status: 500 }
      );
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Generate signed URL for the image if present
    if (post.image_url) {
      post.image_url = await getS3Url(post.image_url);
    }

    // Fetch post tags
    const { data: postTags, error: tagsError } = await supabaseAdmin
      .from('post_tags')
      .select('tag_id')
      .eq('post_id', id);

    if (tagsError) {
      console.error('Error fetching post tags:', tagsError);
      return NextResponse.json(
        { error: 'Failed to fetch post tags' },
        { status: 500 }
      );
    }

    // Return post with tags
    return NextResponse.json({
      post: {
        ...post,
        tags: postTags.map(pt => pt.tag_id)
      }
    });

  } catch (error) {
    console.error('Error in post route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Run validation middleware
  const validationResponse = await validateUpdateBlogPost(request);
  if (validationResponse) return validationResponse;

  const data = (request as any).validatedData;
  const { id: paramId } = params;
  if (!paramId) {
    return NextResponse.json(
      { error: 'Post ID is required' },
      { status: 400 }
    );
  }

  try {
    // Get the current post to check if it's published
    const { data: currentPost, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('slug, is_published')
      .eq('id', paramId)
      .single();

    if (fetchError) {
      console.error('Error fetching current post:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch current post' },
        { status: 500 }
      );
    }

    // Update the post
    const { data: updatedPost, error: updateError } = await supabaseAdmin
      .from('posts')
      .update({
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.excerpt && { excerpt: data.excerpt }),
        ...(data.author_name && { author_name: data.author_name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.is_published !== undefined && { is_published: data.is_published }),
        ...(data.image_url && { image_url: data.image_url }),
        ...(data.image_alt && { image_alt: data.image_alt }),
        published_at: data.is_published ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paramId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating post:', updateError);
      return NextResponse.json(
        { error: `Failed to update post: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Invalidate cache based on the update
    if (currentPost) {
      // If the post was published or unpublished, invalidate all blog caches
      if (data.is_published !== undefined && data.is_published !== currentPost.is_published) {
        await invalidateAllBlogCache();
      } else {
        // Otherwise just invalidate this specific post
        await invalidateBlogPostCache(currentPost.slug);
      }
    }

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error('Error in update route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: paramId } = params;
  if (!paramId) {
    return NextResponse.json(
      { error: 'Post ID is required' },
      { status: 400 }
    );
  }

  try {
    // Get the post to check if it's published and get its slug
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('slug, is_published, image_url')
      .eq('id', paramId)
      .single();

    if (fetchError) {
      console.error('Error fetching post:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch post' },
        { status: 500 }
      );
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Delete the post
    const { error: deleteError } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', paramId);

    if (deleteError) {
      console.error('Error deleting post:', deleteError);
      return NextResponse.json(
        { error: `Failed to delete post: ${deleteError.message}` },
        { status: 500 }
      );
    }

    // Delete the image from S3 if it exists
    if (post.image_url) {
      try {
        await deleteS3File(post.image_url);
      } catch (error) {
        console.error('Error deleting image from S3:', error);
        // Continue with the response even if image deletion fails
      }
    }

    // Invalidate cache based on the post's status
    if (post.is_published) {
      // If the post was published, invalidate all blog caches
      await invalidateAllBlogCache();
    } else {
      // If the post was unpublished, just invalidate this specific post
      await invalidateBlogPostCache(post.slug);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 