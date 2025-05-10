import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getS3Url, deleteS3File } from '@/lib/s3Utils';
import { createValidationMiddleware } from '@/lib/validation/middleware';
import { updateBlogPostSchema } from '@/lib/validation/base';

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
    // Update the post
    const { error: updateError } = await supabaseAdmin
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
      .eq('id', paramId);

    if (updateError) {
      console.error('Error updating post:', updateError);
      return NextResponse.json(
        { error: `Failed to update post: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Handle tags if provided
    if (Array.isArray(data.tags)) {
      // Delete existing tags
      const { error: deleteError } = await supabaseAdmin
        .from('post_tags')
        .delete()
        .eq('post_id', paramId);

      if (deleteError) {
        console.error('Error deleting existing tags:', deleteError);
        return NextResponse.json(
          { error: 'Failed to update post tags' },
          { status: 500 }
        );
      }

      // Insert new tags if any
      if (data.tags.length > 0) {
        const tagRelations = data.tags.map((tagId: string) => ({
          post_id: paramId,
          tag_id: tagId
        }));

        const { error: insertError } = await supabaseAdmin
          .from('post_tags')
          .insert(tagRelations);

        if (insertError) {
          console.error('Error inserting new tags:', insertError);
          return NextResponse.json(
            { error: 'Failed to update post tags' },
            { status: 500 }
          );
        }
      }
    }

    // Fetch updated post
    const { data: updatedPost, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', paramId)
      .single();

    if (fetchError) {
      console.error('Error fetching updated post:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch updated post' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error in update route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // First, get the post to check if it has an image
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('image_url')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching post:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch post' },
        { status: 500 }
      );
    }

    // Delete post tags first (foreign key constraint)
    const { error: tagsError } = await supabaseAdmin
      .from('post_tags')
      .delete()
      .eq('post_id', id);

    if (tagsError) {
      console.error('Error deleting post tags:', tagsError);
      return NextResponse.json(
        { error: 'Failed to delete post tags' },
        { status: 500 }
      );
    }

    // Delete the post
    const { error: deleteError } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting post:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: 500 }
      );
    }

    // If the post had an image, delete it from S3
    if (post?.image_url) {
      try {
        // Delete the entire folder for this post
        const postFolder = `blog/${id}`;
        console.log('Attempting to delete S3 folder:', {
          postId: id,
          imageUrl: post.image_url,
          folderPath: postFolder
        });

        await deleteS3File(postFolder, true);
        console.log('Successfully initiated S3 folder deletion');
      } catch (s3Error) {
        console.error('Error deleting images from S3:', {
          error: s3Error,
          postId: id,
          imageUrl: post.image_url
        });
        // Don't return error since post was deleted successfully
      }
    } else {
      console.log('No image to delete for post:', id);
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