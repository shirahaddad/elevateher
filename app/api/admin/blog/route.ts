import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface Post {
  id: string;
  post_tags: Array<{
    tag_id: string;
    tags: {
      name: string;
    };
  }>;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const isAdmin = request.headers.get('referer')?.includes('/admin');

    // If a tag is specified, filter posts by that tag
    if (tag) {
      const { data: posts, error } = await supabaseAdmin
        .from('posts')
        .select(`
          *,
          post_tags!inner (
            tag_id,
            tags!inner (
              name
            )
          )
        `)
        .eq('post_tags.tags.name', tag)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json(
          { error: 'Failed to fetch posts' },
          { status: 500 }
        );
      }

      // If tag filter is applied, posts already include tag information
      const postsWithTags = (posts as Post[]).map(post => ({
        ...post,
        tags: post.post_tags.map(pt => ({ name: pt.tags.name }))
      }));

      return NextResponse.json({ posts: postsWithTags });
    }

    // If no tag filter, fetch all posts
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

    // Fetch tags for all posts
    const postsWithTags = await Promise.all(posts.map(async (post) => {
      // Fetch post tags
      const { data: postTags, error: tagsError } = await supabaseAdmin
        .from('post_tags')
        .select('tag_id')
        .eq('post_id', post.id);

      if (tagsError) {
        console.error('Error fetching post tags:', tagsError);
        return { ...post, tags: [] };
      }

      // Fetch tag names
      const tagIds = postTags.map(pt => pt.tag_id);
      const { data: tags, error: tagNamesError } = await supabaseAdmin
        .from('tags')
        .select('name')
        .in('id', tagIds);

      if (tagNamesError) {
        console.error('Error fetching tag names:', tagNamesError);
        return { ...post, tags: [] };
      }

      return {
        ...post,
        tags: tags.map(t => ({ name: t.name }))
      };
    }));

    return NextResponse.json({ posts: postsWithTags });
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

    // Insert the new post
    console.log('Attempting to insert post into database...');
    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .insert([
        {
          title: data.title,
          content: data.content,
          excerpt: data.excerpt || null,
          author_name: data.author_name,
          slug: data.slug,
          is_published: data.is_published || false,
          image_url: data.imageUrl || null,
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
      console.log('Creating post-tag relationships with tags:', data.tags);
      const postTagRelationships = data.tags.map((tagId: string) => ({
        post_id: post.id,
        tag_id: tagId
      }));
      console.log('Post-tag relationships to create:', postTagRelationships);
      
      const { error: tagError } = await supabaseAdmin
        .from('post_tags')
        .insert(postTagRelationships);

      if (tagError) {
        console.error('Error creating post-tag relationships:', tagError);
        // We don't return an error here since the post was created successfully
      } else {
        console.log('Successfully created post-tag relationships');
      }
    } else {
      console.log('No tags to create relationships for');
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