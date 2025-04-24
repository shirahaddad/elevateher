import Link from 'next/link';
import Image from 'next/image';

interface PostCardProps {
  title: string;
  excerpt: string;
  slug: string;
  author: 'Shira' | 'Cassie' | 'Team';
  publishedAt: string;
  tags?: string[];
}

export default function PostCard({
  title,
  excerpt,
  slug,
  author,
  publishedAt,
  tags = [],
}: PostCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/blog/${slug}`} className="block">
        <div className="p-6">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex gap-2 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-purple-700 transition-colors">
            {title}
          </h2>

          {/* Excerpt */}
          <p className="text-gray-600 mb-4 line-clamp-2">{excerpt}</p>

          {/* Meta information */}
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
        </div>
      </Link>
    </article>
  );
} 