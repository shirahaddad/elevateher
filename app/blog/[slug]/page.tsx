import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { GetPostResponse } from '@/types/blog';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

async function getPost(slug: string) {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
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
      <article className="max-w-4xl mx-auto px-4 py-8">
        {post.image_url && (
          <div className="relative w-full h-96 mb-8">
            <Image
              src={post.image_url}
              alt={post.image_alt || post.title}
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
        )}
        
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-purple-900 mb-4">{post.title}</h1>
          
          <div className="flex items-center text-sm text-gray-500 mb-8">
            <span>{post.author_name}</span>
            <span className="mx-2">•</span>
            <time dateTime={post.published_at}>{formattedDate}</time>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div 
            className="text-gray-700"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
    </main>
  );
} 