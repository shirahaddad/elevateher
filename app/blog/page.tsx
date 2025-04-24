import Link from 'next/link';
import PostCard from '@/components/blog/PostCard';
import type { ListPostsResponse } from '@/types/blog';

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
          <div className="text-center text-gray-500">
            <p>Blog posts coming soon...</p>
          </div>
        </div>
      </section>
    </main>
  );
} 