import { Metadata } from 'next';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { PostWithTags } from '@/types/blog';
import InfiniteScroll from '@/components/blog/InfiniteScroll';
import TagFilter from '@/components/blog/TagFilter';
import { Suspense } from 'react';

// Loading component for the blog posts section
function BlogPostsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
          <div className="w-full h-48 bg-gray-200" />
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

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
    
    // Add cache-busting in development
    if (process.env.NODE_ENV === 'development') {
      url.searchParams.append('_t', Date.now().toString());
    }
    
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 } // Cache for 1 minute (for testing)
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
    const url = new URL(`${baseUrl}/api/v1/blog/tags`);
    
    // Add cache-busting in development
    if (process.env.NODE_ENV === 'development') {
      url.searchParams.append('_t', Date.now().toString());
    }
    
    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 } // Cache for 1 hour
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
  title: 'Blog | Elevate(Her)',
  description: 'Insights, tips and stories about leadership, technology, and personal growth.',
  openGraph: {
    title: 'Blog | Elevate(Her)',
    description: 'Insights, tips and stories about leadership, technology, and personal growth.',
    url: process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/blog` : 'http://localhost:3000/blog',
    siteName: 'Elevate(Her)',
    images: [
      {
        url: process.env.NEXT_PUBLIC_BASE_URL 
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/og-blog.png`
          : 'http://localhost:3000/og-blog.png',
        width: 1200,
        height: 630,
        alt: 'Elevate(Her) Blog',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Elevate(Her)',
    description: 'Insights, tips and stories about leadership, technology, and personal growth.',
    images: [
      process.env.NEXT_PUBLIC_BASE_URL 
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/og-blog.png`
        : 'http://localhost:3000/og-blog.png',
    ],
  },
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tag = typeof params.tag === 'string' ? params.tag : undefined;
  
  // Load data in parallel
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
            <Suspense fallback={<BlogPostsLoading />}>
              <InfiniteScroll
                initialPosts={initialPosts}
                initialHasMore={initialHasMore}
                selectedTag={tag}
              />
            </Suspense>
          )}
        </div>
      </section>
    </main>
  );
} 