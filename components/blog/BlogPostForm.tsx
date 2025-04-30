/**
 * @file BlogPostForm.tsx
 * @description A comprehensive form component for creating and editing blog posts.
 * This component handles all aspects of blog post management including content editing,
 * image uploads, metadata management, and publishing controls.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MarkdownEditor from '@/components/blog/MarkdownEditor';
import ImageUploader from '@/components/blog/ImageUploader';
import { getAuthorNames } from '@/lib/team';
import { BlogPostFormProps, Tag } from '@/types/blog';

/**
 * @component BlogPostForm
 * @description A form component for creating and editing blog posts
 * @param {BlogPostFormProps} props - The component props
 * @returns {JSX.Element} The rendered form component
 * 
 * @example
 * // Creating a new post
 * <BlogPostForm mode="create" />
 * 
 * // Editing an existing post
 * <BlogPostForm 
 *   mode="edit" 
 *   initialData={{
 *     title: "My Post",
 *     content: "Post content...",
 *     // ... other post data
 *   }} 
 * />
 */
export default function BlogPostForm({ mode, initialData }: BlogPostFormProps) {
  const router = useRouter();
  
  /**
   * @description Form state containing all post data
   * @type {Object}
   */
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    author_name: initialData?.author_name || '',
    tags: initialData?.tags || [],
    is_published: initialData?.is_published || false,
    coverImage: initialData?.coverImage || '',
    imageAlt: initialData?.imageAlt || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.coverImage || null);
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<{ url: string; name: string }[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const excerptCharCount = formData.excerpt.length;
  const EXCERPT_LIMIT = 150;

  /**
   * @description Fetches available tags from the API
   * @async
   * @function fetchTags
   */
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoadingTags(true);
      try {
        const response = await fetch('/api/tags');
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        const data = await response.json();
        setTags(data);
      } catch (err) {
        console.error('Error fetching tags:', err);
        setError('Failed to load tags');
      } finally {
        setIsLoadingTags(false);
      }
    };

    fetchTags();
  }, []);

  /**
   * @description Handles changes to form input fields
   * @function handleInputChange
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e - The change event
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Auto-generate slug when title changes
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: slug
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  /**
   * @description Handles changes to the markdown content
   * @function handleContentChange
   * @param {string | undefined} newContent - The new content value
   */
  const handleContentChange = (newContent: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      content: newContent || ''
    }));
  };

  /**
   * @description Handles changes to selected tags
   * @function handleTagChange
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event
   */
  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedTagIds: string[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedTagIds.push(options[i].value);
      }
    }
    setFormData(prev => ({
      ...prev,
      tags: selectedTagIds
    }));
  };

  /**
   * @description Handles image file selection
   * @function handleImageChange
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // Auto-generate alt text from file name
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      const formattedAlt = nameWithoutExt
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      setFormData(prev => ({
        ...prev,
        imageAlt: formattedAlt
      }));
    } else {
      setImageFile(null);
      setPreviewUrl(null);
      setFormData(prev => ({
        ...prev,
        imageAlt: ''
      }));
    }
  };

  /**
   * @description Handles selection of an existing image
   * @function handleImageSelect
   * @param {string} imageUrl - The URL of the selected image
   */
  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setPreviewUrl(imageUrl);
    setFormData(prev => ({
      ...prev,
      coverImage: imageUrl,
      imageAlt: imageUrl.split('/').pop()?.replace(/\.[^/.]+$/, '') || ''
    }));
  };

  /**
   * @description Handles image upload to the server
   * @function handleImageUpload
   * @param {React.FormEvent} e - The form event
   */
  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return;

    setLoading(true);
    setImageError(null);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const { url } = await response.json();
      setPreviewUrl(url);
      setFormData(prev => ({
        ...prev,
        coverImage: url,
        imageAlt: imageFile.name.replace(/\.[^/.]+$/, '')
      }));
      setImageFile(null);
    } catch (err) {
      console.error('Error uploading image:', err);
      setImageError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Fetches available images from the server
   * @async
   * @function fetchImages
   */
  const fetchImages = async () => {
    setIsLoadingImages(true);
    try {
      const response = await fetch('/api/images');
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      const data = await response.json();
      setImages(data);
    } catch (err) {
      console.error('Error fetching images:', err);
      setImageError(err instanceof Error ? err.message : 'Failed to fetch images');
    } finally {
      setIsLoadingImages(false);
    }
  };

  /**
   * @description Fetches images when the image selector is opened
   */
  useEffect(() => {
    if (isImageSelectorOpen) {
      fetchImages();
    }
  }, [isImageSelectorOpen]);

  /**
   * @description Handles form submission
   * @function handleSubmit
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      const requiredFields = ['title', 'content', 'author_name', 'slug'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate excerpt length
      if (formData.excerpt && formData.excerpt.length > EXCERPT_LIMIT) {
        throw new Error(`Excerpt must be ${EXCERPT_LIMIT} characters or less`);
      }

      let imageUrl = formData.coverImage;

      // Handle image upload if a new file is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const { url } = await uploadResponse.json();
        imageUrl = url;
      }

      const postData = {
        ...formData,
        coverImage: imageUrl,
      };

      const endpoint = mode === 'create' ? '/api/admin/blog' : `/api/admin/blog/${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save post');
      }

      router.push('/admin/blog');
    } catch (err) {
      console.error('Error saving post:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="py-8 bg-purple-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-purple-900 tracking-tight">
                {mode === 'create' ? 'New Blog Post' : 'Edit Blog Post'}
              </h1>
              <p className="mt-2 text-gray-600">
                {mode === 'create' ? 'Create a new blog post' : 'Edit existing blog post'}
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
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Enter post title"
                required
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
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="enter-post-slug"
                required
              />
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author_name" className="block text-sm font-medium text-gray-700">
                Author
              </label>
              <select
                id="author_name"
                name="author_name"
                value={formData.author_name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              >
                <option value="">Select author</option>
                {getAuthorNames().map((author) => (
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
                name="tags"
                multiple
                value={formData.tags}
                onChange={handleTagChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                size={4}
                disabled={isLoadingTags}
              >
                {isLoadingTags ? (
                  <option value="">Loading tags...</option>
                ) : (
                  tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))
                )}
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
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
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
                value={formData.content}
                onChange={handleContentChange}
              />
            </div>

            {/* Cover Image */}
            <div>
              <ImageUploader
                selectedImage={imageFile}
                imageAlt={formData.imageAlt}
                onImageChange={(file) => {
                  setImageFile(file);
                  if (!file) {
                    setFormData(prev => ({ ...prev, coverImage: '', imageAlt: '' }));
                  }
                }}
                onImageAltChange={(alt) => setFormData(prev => ({ ...prev, imageAlt: alt }))}
              />
            </div>

            {/* Image Alt Text */}
            <div>
              <label htmlFor="imageAlt" className="block text-sm font-medium text-gray-700">
                Image Alt Text
              </label>
              <input
                type="text"
                id="imageAlt"
                name="imageAlt"
                value={formData.imageAlt}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-4 items-end sm:items-center">
              {/* Draft/Publish Switch */}
              <div className="flex items-center gap-2 mb-2 sm:mb-0">
                <span className="text-sm text-gray-700">Publish</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.is_published ? 'true' : 'false'}
                  onClick={() => setFormData(prev => ({ ...prev, is_published: !prev.is_published }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${!formData.is_published ? 'bg-gray-300' : 'bg-purple-600'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!formData.is_published ? 'translate-x-6' : 'translate-x-1'}`}
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
                disabled={loading}
                className={`bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Saving...' : mode === 'create' ? 'Create Post' : 'Update Post'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
} 