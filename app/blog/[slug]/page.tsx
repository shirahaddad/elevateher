import { notFound } from 'next/navigation';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">
          <p>Blog post content coming soon...</p>
        </div>
      </article>
    </main>
  );
} 