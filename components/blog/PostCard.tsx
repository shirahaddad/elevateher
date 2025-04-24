import Link from 'next/link';
import type { PostWithTags } from '@/types/blog';

interface PostCardProps extends Pick<PostWithTags, 'title' | 'excerpt' | 'slug' | 'publishedAt' | 'tags'> {
  author: string; // We'll just use the author name for display
}

export default function PostCard({
  title,
  excerpt,
  slug,
  author,
  publishedAt,
  tags
}: PostCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <Link href={`/blog/${slug}`} className="block p-6">
        {tags.length > 0 && (
          <div className="flex gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag.name}
                className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h2>
        <p className="text-gray-600 mb-4">
          {excerpt}
        </p>
        <div className="flex items-center text-sm text-gray-500">
          <span>{author}</span>
          <span className="mx-2">•</span>
          <time dateTime={publishedAt}>
            {new Date(publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
      </Link>
    </div>
  );
} 