import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { GetPostResponse } from '@/types/blog';
import TagList from '@/components/blog/TagList';

// Lazy load the MarkdownPreview component
const MarkdownPreview = dynamic(() => import('@/components/blog/MarkdownPreview'), {
  loading: () => <div className="animate-pulse">Loading content...</div>
});

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

async function getPost(slug: string) {
  // Use absolute URL in production, relative URL in development
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://elevateher.tech'
    : 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/blog/${slug}`, {
    next: { revalidate: 60 } // Revalidate every minute
  });

  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch post');
  }

  return res.json() as Promise<GetPostResponse>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { post } = await getPost(params.slug);
  const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column (1/3) */}
          <div className="space-y-6">
            {post.image_url && (
              <div className="relative w-full aspect-[4/3]">
                <Image
                  src={post.image_url}
                  alt={post.image_alt || post.title}
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
            )}
            
            {post.tags && post.tags.length > 0 && (
              <TagList tags={post.tags} />
            )}

            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>

          {/* Right Column (2/3) */}
          <div className="col-span-2">
            <div className="prose prose-lg max-w-none">
              <h1 className="text-4xl font-bold text-purple-900 mb-4">{post.title}</h1>
              
              <div className="flex items-center text-sm text-gray-500 mb-8">
                <span>{post.author_name}</span>
                <span className="mx-2">•</span>
                <time dateTime={post.published_at}>{formattedDate}</time>
              </div>

              <MarkdownPreview content={post.content} />
            </div>
          </div>
        </div>
      </article>
    </main>
  );
} 