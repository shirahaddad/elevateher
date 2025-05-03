'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import PostCard from '@/components/blog/PostCard';
import type { Post } from '@/types/blog';

interface PostWithTags extends Post {
  post_tags: {
    tag_id: string;
    tags: {
      name: string;
    } | null;
  }[] | null;
}

interface InfiniteScrollProps {
  initialPosts: PostWithTags[];
  initialHasMore: boolean;
  selectedTag?: string;
}

export default function InfiniteScroll({ initialPosts, initialHasMore, selectedTag }: InfiniteScrollProps) {
  const [posts, setPosts] = useState<PostWithTags[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    const fetchMorePosts = async () => {
      if (page === 1) return; // Skip initial page since we already have those posts
      
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const url = new URL(`${baseUrl}/api/v1/blog`);
        if (selectedTag) {
          url.searchParams.append('tag', selectedTag);
        }
        url.searchParams.append('is_published', 'true');
        url.searchParams.append('page', page.toString());
        url.searchParams.append('limit', '6');
        
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Failed to fetch posts');
        
        const data = await res.json();
        const newPosts = data.data.data;
        
        setPosts(prevPosts => [...prevPosts, ...newPosts]);
        setHasMore(data.data.total > page * 6);
      } catch (error) {
        console.error('Error fetching more posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMorePosts();
  }, [page, selectedTag]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post, index) => (
        <div
          key={post.slug}
          ref={index === posts.length - 1 ? lastPostRef : undefined}
        >
          <PostCard
            title={post.title}
            slug={post.slug}
            author={post.author_name}
            published_at={post.published_at}
            image_url={post.image_url}
            tags={post.post_tags?.map(tag => tag.tags?.name).filter(Boolean) || []}
            excerpt={post.excerpt}
          />
        </div>
      ))}
      {loading && (
        <div className="col-span-full text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      )}
    </div>
  );
} 