'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getS3PublicUrl } from '@/lib/s3Utils';

interface PostCardProps {
  title: string;
  slug: string;
  author: string;
  published_at: string;
  image_url?: string;
  tags?: (string | null | undefined)[];
  excerpt?: string;
  /** Set true for the first 1–2 cards above the fold so their images load first; rest stay lazy. */
  priority?: boolean;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function PostCard({
  title,
  slug,
  author,
  published_at,
  image_url,
  tags = [],
  excerpt,
  priority = false,
}: PostCardProps) {
  const formattedDate = formatDate(published_at);
  const imageUrl = image_url ? getS3PublicUrl(image_url) : null;
  const validTags = tags.filter((tag): tag is string => typeof tag === 'string');

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <Link href={`/blog/${slug}`} prefetch className="block">
        <div className="relative w-full h-48 bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
            />
          ) : image_url ? (
            <div className="w-full h-full bg-gray-200 animate-pulse" />
          ) : null}
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold text-purple-900 mb-2 line-clamp-2">
            {title}
          </h2>
          {validTags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {validTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {excerpt && (
            <p className="text-gray-600 mb-4 line-clamp-2">
              {excerpt}
            </p>
          )}
          <div className="flex items-center text-sm text-gray-500 gap-2 min-w-0">
            <span className="flex-1 truncate">{author}</span>
            <span className="shrink-0">•</span>
            <time dateTime={published_at} className="shrink-0 whitespace-nowrap">
              {formattedDate}
            </time>
          </div>
        </div>
      </Link>
    </div>
  );
} 