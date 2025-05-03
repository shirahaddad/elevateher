import { Metadata } from 'next';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { PostWithTags } from '@/types/blog';
import InfiniteScroll from '@/components/blog/InfiniteScroll';
import TagFilter from '@/components/blog/TagFilter';

async function getPosts(tag?: string, page: number = 1, limit: number = 6) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = new URL(`${baseUrl}/api/v1/blog`);
    if (tag) {
      url.searchParams.append('tag', tag);
    }
    url.searchParams.append('is_published', 'true');
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    
    const res = await fetch(url.toString(), {
      cache: 'no-store' // Ensure fresh data on each request
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    const data = await res.json();
    return {
      posts: data.data.data,
      hasMore: data.data.total > page * limit
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], hasMore: false };
  }
}

async function getTags() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/v1/blog/tags`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error('Failed to fetch tags:', res.status, res.statusText);
      return [];
    }
    
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Blog | ElevateHer',
  description: 'Insights, tips and stories about leadership, technology, and personal growth.',
};

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function BlogPage({ searchParams }: PageProps) {
  const tag = typeof searchParams.tag === 'string' ? searchParams.tag : undefined;
  const [tags, { posts: initialPosts, hasMore: initialHasMore }] = await Promise.all([
    getTags(),
    getPosts(tag, 1)
  ]);

  return (
    <main className="min-h-screen bg-white">
      {/* Blog Header Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-purple-900 tracking-tight">
            Blog
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Insights, tips and stories about leadership, technology, and personal growth.
          </p>
          <TagFilter tags={tags} selectedTag={tag} />
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="pt-2 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          {initialPosts.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>No blog posts available{tag ? ` tagged with "${tag}"` : ''}.</p>
            </div>
          ) : (
            <InfiniteScroll
              initialPosts={initialPosts}
              initialHasMore={initialHasMore}
              selectedTag={tag}
            />
          )}
        </div>
      </section>
    </main>
  );
} 