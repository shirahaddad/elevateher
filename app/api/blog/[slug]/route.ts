import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getS3Url } from '@/lib/s3Utils';

// Cache duration in seconds (1 hour)
const CACHE_DURATION = 3600;

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

    // Fetch tag names
    const tagIds = postTags.map(pt => pt.tag_id);
    const { data: tags, error: tagNamesError } = await supabase
      .from('tags')
      .select('name')
      .in('id', tagIds);

    if (tagNamesError) {
      console.error('Error fetching tag names:', tagNamesError);
      return NextResponse.json(
        { error: 'Failed to fetch tag names' },
        { status: 500 }
      );
    }

    // Create response with cache headers
    return new NextResponse(JSON.stringify({
      post: {
        ...post,
        tags: tags.map(t => t.name)
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
      },
    });

  } catch (error) {
    console.error('Error in post route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 