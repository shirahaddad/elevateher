import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First fetch the post
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', params.id)
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

    // Then fetch the post's tags
    const { data: tags, error: tagsError } = await supabaseAdmin
      .from('post_tags')
      .select('tag_id')
      .eq('post_id', params.id);

    if (tagsError) {
      console.error('Error fetching post tags:', tagsError);
      return NextResponse.json(
        { error: 'Failed to fetch post tags' },
        { status: 500 }
      );
    }

    // Combine the post data with its tag IDs
    const postWithTags = {
      ...post,
      tags: tags?.map(tag => tag.tag_id) || []
    };

    return NextResponse.json({ post: postWithTags });
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
    console.log('Tags data:', data.tags);

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
        author_name: data.author_name,
        slug: data.slug,
        is_published: data.is_published || false,
        image_url: data.coverImage ? `/images/blog/${data.coverImage.split('/').pop()}` : null,
        image_alt: data.imageAlt || null,
        published_at: data.is_published ? new Date().toISOString() : null,
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

    // Handle tags
    if (data.tags && data.tags.length > 0) {
      console.log('Updating post-tag relationships with tags:', data.tags);
      
      // First, delete existing relationships
      const { error: deleteError } = await supabaseAdmin
        .from('post_tags')
        .delete()
        .eq('post_id', params.id);

      if (deleteError) {
        console.error('Error deleting existing post-tag relationships:', deleteError);
      }

      // Then create new relationships
      const postTagRelationships = data.tags.map((tagId: string) => ({
        post_id: params.id,
        tag_id: tagId
      }));
      
      const { error: tagError } = await supabaseAdmin
        .from('post_tags')
        .insert(postTagRelationships);

      if (tagError) {
        console.error('Error creating post-tag relationships:', tagError);
      } else {
        console.log('Successfully updated post-tag relationships');
      }
    } else {
      // If no tags are provided, delete all existing relationships
      const { error: deleteError } = await supabaseAdmin
        .from('post_tags')
        .delete()
        .eq('post_id', params.id);

      if (deleteError) {
        console.error('Error deleting post-tag relationships:', deleteError);
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