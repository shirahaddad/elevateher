/**
 * Blog Post Page Component
 * 
 * This page component renders individual blog posts using dynamic routing based on the post slug.
 * It includes metadata generation for SEO, lazy-loaded markdown content rendering, and responsive layout.
 * 
 * @module BlogPostPage
 */

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { FullPost } from '@/types/blog';
import TagList from '@/components/blog/TagList';
import { Metadata } from 'next';

// Lazy load the MarkdownPreview component
const MarkdownPreview = dynamic(() => import('@/components/blog/MarkdownPreview'), {
  loading: () => <div className="animate-pulse">Loading content...</div>
});

/**
 * Props interface for the BlogPostPage component
 * @interface BlogPostPageProps
 */
interface BlogPostPageProps {
  params: {
    slug: string; // The URL slug of the blog post
  };
}

interface GetPostResponse {
  post: FullPost;
}

/**
 * Fetches a blog post by its slug
 * 
 * @param {string} slug - The URL slug of the blog post to fetch
 * @returns {Promise<GetPostResponse>} The blog post data
 * @throws {Error} If the post fetch fails
 */
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

/**
 * Generates metadata for the blog post page
 * 
 * @param {BlogPostPageProps} props - The component props
 * @returns {Promise<Metadata>} The generated metadata object
 */
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { post } = await getPost(resolvedParams.slug);
  
  return {
    title: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    keywords: post.tags || [],
    authors: [{ name: post.author_name }],
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      type: 'article',
      publishedTime: post.published_at,
      authors: [post.author_name],
      images: post.image_url ? [
        {
          url: post.image_url,
          alt: post.imageAlt || post.title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      images: post.image_url ? [post.image_url] : undefined,
    },
    alternates: {
      canonical: `/blog/${resolvedParams.slug}`,
    },
  };
}

/**
 * Blog Post Page Component
 * 
 * Renders a full blog post with title, author, date, content, and associated metadata.
 * The layout is responsive with a 1/3 - 2/3 grid on desktop and stacked on mobile.
 * 
 * @param {BlogPostPageProps} props - The component props
 * @returns {Promise<JSX.Element>} The rendered blog post page
 */
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const { post } = await getPost(resolvedParams.slug);
  const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column (1/3) */}
          <div className="space-y-6 order-2 md:order-1">
            {post.image_url && (
              <div className="relative w-full aspect-[4/3]">
                <Image
                  src={post.image_url}
                  alt={post.imageAlt || post.title}
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
          <div className="col-span-1 md:col-span-2 order-1 md:order-2">
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