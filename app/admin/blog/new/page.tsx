'use client';

import BlogPostForm from '@/components/BlogPostForm';

export default function NewBlogPostPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Blog Post</h1>
      <BlogPostForm mode="create" />
    </div>
  );
} 