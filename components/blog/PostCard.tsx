'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getS3Url } from '@/lib/s3Utils';

interface PostCardProps {
  title: string;
  slug: string;
  author: string;
  published_at: string;
  image_url?: string;
  tags?: (string | null | undefined)[];
  excerpt?: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

export default function PostCard({
  title,
  slug,
  author,
  published_at,
  image_url,
  tags = [],
  excerpt
}: PostCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const formattedDate = formatDate(published_at);

  useEffect(() => {
    if (image_url) {
      getS3Url(image_url).then(url => setImageUrl(url));
    }
  }, [image_url]);

  const validTags = tags.filter((tag): tag is string => typeof tag === 'string');

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <Link href={`/blog/${slug}`} className="block">
        <div className="relative w-full h-48 bg-gray-100">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
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