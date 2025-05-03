'use client';

import { useRouter } from 'next/navigation';

interface TagListProps {
  tags: string[];
}

export default function TagList({ tags }: TagListProps) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => router.push(`/blog?tag=${encodeURIComponent(tag)}`)}
          className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded hover:bg-purple-200 transition-colors"
        >
          {tag}
        </button>
      ))}
    </div>
  );
} 