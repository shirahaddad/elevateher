import Link from 'next/link';
import PostCard from '@/components/blog/PostCard';
import type { PostWithTags } from '@/types/blog';
import { X } from 'lucide-react';

async function getPosts(tag?: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = new URL(`${baseUrl}/api/admin/blog`);
    if (tag) {
      url.searchParams.append('tag', tag);
    }
    
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 } // Revalidate every minute
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    const data = await res.json();
    console.log('API Response:', data); // Debug log
    
    if (!data.posts) {
      throw new Error('Invalid response format');
    }
    
    const posts = data.posts.filter((post: PostWithTags) => post.is_published);
    console.log('Filtered Posts:', posts); // Debug log
    
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
  const posts = await getPosts(searchParams.tag);
  const selectedTag = searchParams.tag;

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
          {posts.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>No blog posts available{selectedTag ? ` tagged with "${selectedTag}"` : ''}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.map((post: PostWithTags) => {
                console.log('Post Data:', post); // Debug log for each post
                return (
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
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
} 