import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Creating new blog post with data:', data);

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

    // Insert the new post
    console.log('Attempting to insert post into database...');
    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .insert([
        {
          title: data.title,
          content: data.content,
          excerpt: data.excerpt || null,
          author_name: data.authorId,
          slug: data.slug,
          is_published: data.is_published || false,
          image_url: data.coverImage ? `/images/blog/${data.coverImage.split('/').pop()}` : null,
          image_alt: data.imageAlt || null,
          published_at: data.is_published ? new Date().toISOString() : null,
        }
      ])
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
        { error: `Failed to create post: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Successfully created post:', post);

    // If there are tags, create the post-tag relationships
    if (data.tags && data.tags.length > 0) {
      console.log('Creating post-tag relationships:', data.tags);
      const { error: tagError } = await supabaseAdmin
        .from('post_tags')
        .insert(
          data.tags.map((tagId: string) => ({
            post_id: post.id,
            tag_id: tagId
          }))
        );

      if (tagError) {
        console.error('Error creating post-tag relationships:', tagError);
        // We don't return an error here since the post was created successfully
      }
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

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing post ID' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 