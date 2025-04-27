'use client';

import Link from 'next/link';
import { useState } from 'react';
import MarkdownEditor from '@/components/blog/MarkdownEditor';
import type { CreatePostRequest } from '@/types/blog';
import ImageUploader from '@/components/blog/ImageUploader';

const AUTHORS = ['Shira', 'Cassie', 'Team'] as const;
const TAGS = [
  'Career Growth',
  'Mindset',
  'Professional Development',
  'Leadership',
  'Technology',
  'Personal Growth',
  'Networking',
  'Workplace',
] as const;

export default function NewBlogPostPage() {
  const [formData, setFormData] = useState<Partial<CreatePostRequest>>({
    title: '',
    content: '',
    excerpt: '',
    authorId: '',
    tags: [],
    isDraft: true
  });

  const [slug, setSlug] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageAlt, setImageAlt] = useState('');
  const excerptCharCount = formData.excerpt?.length || 0;
  const EXCERPT_LIMIT = 150;

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData(prev => ({ ...prev, title: newTitle }));
    setSlug(generateSlug(newTitle));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
  };

  const handleExcerptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, excerpt: e.target.value }));
  };

  const handleContentChange = (newContent: string | undefined) => {
    setFormData(prev => ({ ...prev, content: newContent || '' }));
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, authorId: e.target.value }));
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedTags: string[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedTags.push(options[i].value);
      }
    }
    setFormData(prev => ({ ...prev, tags: selectedTags }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      // Auto-generate alt text from file name
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      const formattedAlt = nameWithoutExt
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      setImageAlt(formattedAlt);
    } else {
      setSelectedImage(null);
      setImagePreview(null);
      setImageAlt('');
    }
  };

  const handleImageAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageAlt(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Log form data, image, and alt text
    console.log({ ...formData, slug, image: selectedImage, imageAlt });
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="py-8 bg-purple-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-purple-900 tracking-tight">
                New Blog Post
              </h1>
              <p className="mt-2 text-gray-600">
                Create a new blog post
              </p>
            </div>
            <Link
              href="/admin/blog"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Posts
            </Link>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={handleTitleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Enter post title"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Slug
              </label>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={handleSlugChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="enter-post-slug"
              />
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                Author
              </label>
              <select
                id="author"
                value={formData.authorId}
                onChange={handleAuthorChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="">Select author</option>
                {AUTHORS.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <select
                id="tags"
                multiple
                value={formData.tags}
                onChange={handleTagChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                size={4}
              >
                {TAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Hold Ctrl (Windows) or Command (Mac) to select multiple tags
              </p>
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={handleExcerptChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Brief description of the post"
              />
              <p className={`mt-1 text-sm ${excerptCharCount > EXCERPT_LIMIT ? 'text-red-500' : 'text-gray-500'}`}>
                {excerptCharCount}/{EXCERPT_LIMIT} characters
              </p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <MarkdownEditor
                value={formData.content || ''}
                onChange={handleContentChange}
              />
            </div>

            {/* Main Image (placeholder) */}
            <ImageUploader
              selectedImage={selectedImage}
              imageAlt={imageAlt}
              onImageChange={setSelectedImage}
              onImageAltChange={setImageAlt}
            />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-4 items-end sm:items-center">
              {/* Draft/Publish Switch */}
              <div className="flex items-center gap-2 mb-2 sm:mb-0">
                <span className="text-sm text-gray-700">Publish</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.isDraft ? 'true' : 'false'}
                  onClick={() => setFormData(prev => ({ ...prev, isDraft: !prev.isDraft }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${formData.isDraft ? 'bg-gray-300' : 'bg-purple-600'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isDraft ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
                <span className="text-sm text-gray-700">Save as draft</span>
              </div>
              <Link
                href="/admin/blog"
                className="px-4 py-2 text-gray-700 hover:text-gray-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Create Post
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
} 