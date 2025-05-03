'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { PostWithTags } from '@/types/blog';
import { X } from 'lucide-react';

// Lazy load the PostCard component
const PostCard = dynamic(() => import('@/components/blog/PostCard'), {
  loading: () => (
    <div className="animate-pulse bg-gray-100 rounded-lg h-[400px] w-full" />
  )
});

async function getPosts(tag?: string, page: number = 1, limit: number = 6) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = new URL(`${baseUrl}/api/admin/blog`);
    if (tag) {
      url.searchParams.append('tag', tag);
    }
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 } // Revalidate every minute
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    const data = await res.json();
    return {
      posts: data.posts.filter((post: PostWithTags) => post.is_published),
      hasMore: data.hasMore
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], hasMore: false };
  }
}

export default function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const [posts, setPosts] = useState<PostWithTags[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { tag: selectedTag } = use(searchParams);

  useEffect(() => {
    const loadInitialPosts = async () => {
      setIsLoading(true);
      const { posts: initialPosts, hasMore: initialHasMore } = await getPosts(selectedTag, 1);
      setPosts(initialPosts);
      setHasMore(initialHasMore);
      setIsLoading(false);
    };

    loadInitialPosts();
  }, [selectedTag]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setIsLoading(true);
          const nextPage = page + 1;
          const { posts: newPosts, hasMore: newHasMore } = await getPosts(selectedTag, nextPage);
          setPosts((prevPosts) => [...prevPosts, ...newPosts]);
          setPage(nextPage);
          setHasMore(newHasMore);
          setIsLoading(false);
        }
      },
      { threshold: 0.5 }
    );

    const sentinel = document.getElementById('sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [page, hasMore, isLoading, selectedTag]);

  return (
    <main className="min-h-screen bg-white">
      {/* Blog Header Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-purple-900 tracking-tight">
            Blog
          </h1>
          <p className="text-xl text-gray-600">
            Insights, tips and stories about leadership, technology, and personal growth.
          </p>
          {selectedTag && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-gray-600">Showing posts tagged with:</span>
              <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                {selectedTag}
                <Link
                  href="/blog"
                  className="hover:text-purple-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </Link>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="pt-2 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          {posts.length === 0 && !isLoading ? (
            <div className="text-center text-gray-500">
              <p>No blog posts available{selectedTag ? ` tagged with "${selectedTag}"` : ''}.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    title={post.title}
                    slug={post.slug}
                    author={post.author_name}
                    published_at={post.published_at}
                    image_url={post.image_url}
                    tags={post.tags?.map(tag => tag.name) || []}
                    excerpt={post.excerpt}
                  />
                ))}
              </div>
              
              {/* Loading indicator and sentinel */}
              <div id="sentinel" className="h-10" />
              {isLoading && (
                <div className="flex justify-center mt-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
} 