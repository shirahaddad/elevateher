'use client';

import Link from 'next/link';
import type { Post } from '@/types/blog';
import { useState } from 'react';

interface PostCardProps {
  title: string;
  slug: string;
  author: string;
  published_at: string;
  image_url?: string;
  tags?: string[];
  excerpt?: string;
}

export default function PostCard({
  title,
  slug,
  author,
  published_at,
  image_url,
  tags = [],
  excerpt
}: PostCardProps) {
  const [error, setError] = useState<string | null>(null);
  const formattedDate = new Date(published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <Link href={`/blog/${slug}`} className="block">
        <div className="relative w-full h-48 bg-gray-100">
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold text-purple-900 mb-2 line-clamp-2">
            {title}
          </h2>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
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
          {excerpt && (
            <p className="text-gray-600 mb-4 line-clamp-2">
              {excerpt}
            </p>
          )}
          <div className="flex items-center text-sm text-gray-500">
            <span>{author}</span>
            <span className="mx-2">•</span>
            <time dateTime={published_at}>
              {formattedDate}
            </time>
          </div>
        </div>
      </Link>
    </div>
  );
} 