import Link from 'next/link';
import PostCard from '@/components/blog/PostCard';
import { samplePosts } from './_dev/sample-data';

type Author = 'Shira' | 'Cassie' | 'Team';

interface BlogPost {
  title: string;
  excerpt: string;
  slug: string;
  author: Author;
  publishedAt: string;
  tags: string[];
}

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Blog Header Section */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-purple-900 tracking-tight">
            Blog
          </h1>
          <p className="text-xl text-gray-600">
            Insights, tips and stories about leadership, technology, and personal growth.
          </p>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="pt-2 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-6">
            {samplePosts.map((post) => (
              <PostCard
                key={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                slug={post.slug}
                author={post.author}
                publishedAt={post.publishedAt}
                tags={post.tags}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
} 