import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
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

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    console.log('Updating blog post with data:', data);

    // Validate required fields
    const requiredFields = ['title', 'content', 'author_name', 'slug'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Update the post
    console.log('Attempting to update post in database...');
    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .update({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || null,
        author_name: data.authorId,
        slug: data.slug,
        is_published: data.isPublished,
        image_url: data.coverImage ? `/images/blog/${data.coverImage.split('/').pop()}` : null,
        image_alt: data.imageAlt || null,
        published_at: data.isPublished ? new Date().toISOString() : null,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { error: `Failed to update post: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Successfully updated post:', post);
    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 