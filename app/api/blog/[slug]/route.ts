import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getS3Url } from '@/lib/s3Utils';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Fetch the post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
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
    const { data: postTags, error: tagsError } = await supabase
      .from('post_tags')
      .select('tag_id')
      .eq('post_id', post.id);

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