'use client';

import { X } from 'lucide-react';

interface TagFilterProps {
  tags: { name: string }[];
  selectedTag?: string;
}

export default function TagFilter({ tags, selectedTag }: TagFilterProps) {
  const handleTagClick = (tagName: string) => {
    const newUrl = selectedTag === tagName ? '/blog' : `/blog?tag=${encodeURIComponent(tagName)}`;
    window.location.href = newUrl;
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-gray-600 mr-2">Filter by:</span>
      {tags.map((tag) => (
        <button
          key={tag.name}
          onClick={() => handleTagClick(tag.name)}
          aria-pressed={selectedTag === tag.name}
          aria-label={`${selectedTag === tag.name ? 'Remove' : 'Apply'} filter for ${tag.name}`}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
            selectedTag === tag.name
              ? 'bg-purple-600 text-white'
              : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
          }`}
        >
          {tag.name}
          {selectedTag === tag.name && <X className="w-4 h-4" aria-hidden="true" />}
        </button>
      ))}
    </div>
  );
} 