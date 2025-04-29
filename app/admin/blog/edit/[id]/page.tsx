'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BlogPostForm from '@/components/blog/BlogPostForm';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_name: string;
  is_published: boolean;
  image_url: string | null;
  image_alt: string | null;
  tags?: string[];
}

export default function EditBlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/admin/blog/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        const data = await response.json();
        setPost(data.post);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-red-600">Post not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Blog Post</h1>
      <BlogPostForm
        mode="edit"
        initialData={{
          ...post,
          author_name: post.author_name,
          is_published: post.is_published,
          coverImage: post.image_url || '',
          imageAlt: post.image_alt || '',
          tags: post.tags || [],
        }}
      />
    </div>
  );
} 