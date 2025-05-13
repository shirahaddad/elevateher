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
import { deleteS3File, getS3Url } from '@/lib/s3Utils';
import { generateExcerpt } from '@/lib/utils/excerpt';

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
    imageUrl: initialData?.imageUrl || '',
    imageAlt: initialData?.imageAlt || '',
    imageKey: '',
    originalImageKey: initialData?.imageUrl || '',
    imageUrlPromise: undefined as Promise<string> | undefined,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
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

  // Effect to handle async image URL generation
  useEffect(() => {
    if (formData.imageUrl && !formData.imageUrl.startsWith('http')) {
      const urlPromise = getS3Url(formData.imageUrl);
      setFormData(prev => ({
        ...prev,
        imageUrlPromise: urlPromise
      }));
    } else if (formData.imageUrl) {
      // If it's already a full URL, create a resolved promise
      setFormData(prev => ({
        ...prev,
        imageUrlPromise: Promise.resolve(formData.imageUrl)
      }));
    }
  }, [formData.imageUrl]);

  /**
   * @description Handles changes to standard form input fields
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
    } else if (name === 'author_name') {
      const selectElement = e.target as HTMLSelectElement;
      const selectedAuthors: string[] = [];
      for (let i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].selected) {
          selectedAuthors.push(selectElement.options[i].value);
        }
      }
      setFormData(prev => ({
        ...prev,
        author_name: selectedAuthors.join(', ')
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
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

  const handleContentChange = (value?: string) => {
    const content = value || '';
    setFormData(prev => ({
      ...prev,
      content,
      // Always regenerate excerpt if it's empty or exceeds the limit
      excerpt: !prev.excerpt || prev.excerpt.length > EXCERPT_LIMIT 
        ? generateExcerpt(content, EXCERPT_LIMIT)
        : prev.excerpt
    }));
  };

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

      // Create or update the post
      const endpoint = mode === 'create' ? '/api/admin/blog' : `/api/admin/blog/${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          image_url: formData.imageKey || formData.originalImageKey || null,
          image_alt: formData.imageAlt,
          imageUrl: undefined,
          imageAlt: undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to save post');
      }

      let postData;
      try {
        const responseData = await response.json();
        console.log('Raw response data:', responseData);
        
        // Handle both direct post data and wrapped response formats
        postData = responseData.post || responseData;
        console.log('Processed post data:', postData);
        
        if (!postData || !postData.id) {
          console.error('Invalid post data structure:', responseData);
          throw new Error('Invalid post data structure: missing ID');
        }
      } catch (e) {
        console.error('Failed to parse server response:', e);
        throw new Error('Invalid server response');
      }

      // Handle image if needed
      if (formData.imageKey && formData.imageKey.startsWith('blog/temp/')) {
        try {
          const postId = String(postData.id);
          if (!postId || postId === 'undefined' || postId === 'null') {
            console.error('Invalid post ID format:', postId);
            throw new Error('Invalid post ID format');
          }

          const moveData = {
            tempKey: formData.imageKey,
            postId: postId
          };
          
          console.log('Moving image with data:', moveData);

          // Move image from temp to final location using the new endpoint
          const moveResponse = await fetch(`${window.location.origin}/api/admin/blog/move-image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(moveData),
          });

          const moveResponseText = await moveResponse.text();
          console.log('Move response text:', moveResponseText);

          if (!moveResponse.ok) {
            throw new Error(moveResponseText || 'Failed to move image');
          }

          let moveResult;
          try {
            moveResult = JSON.parse(moveResponseText);
            console.log('Move result:', moveResult);
          } catch (e) {
            console.error('Failed to parse move response:', e);
            throw new Error('Invalid response from move endpoint');
          }

          if (!moveResult || !moveResult.imageKey) {
            throw new Error('Invalid move result: missing imageKey');
          }

          // Update post with final image path
          const updateResponse = await fetch(`${window.location.origin}/api/admin/blog/${postId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image_url: moveResult.imageKey,
              image_alt: formData.imageAlt,
            }),
          });

          if (!updateResponse.ok) {
            console.error('Failed to update post with final image path');
            // Don't throw here as the post was already created successfully
          }
        } catch (error) {
          console.error('Error handling image:', error);
          // Continue with post creation even if image handling fails
          // The post was already created successfully
        }
      }

      router.push('/admin/blog');
    } catch (err) {
      console.error('Error saving post:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (file: File | null) => {
    setImageFile(file);
    if (!file) {
      setFormData(prev => ({
        ...prev,
        imageUrl: '',
        imageAlt: '',
        imageKey: '',
        imageUrlPromise: undefined,
      }));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      const urlPromise = getS3Url(data.key);
      
      setFormData(prev => ({
        ...prev,
        imageUrl: data.key,
        imageKey: data.key,
        imageUrlPromise: urlPromise,
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
      setFormData(prev => ({
        ...prev,
        imageUrl: '',
        imageKey: '',
        imageUrlPromise: undefined,
      }));
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
                Authors
              </label>
              <select
                id="author_name"
                name="author_name"
                multiple
                value={formData.author_name.split(', ').filter(Boolean)}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                size={4}
                required
              >
                {getAuthorNames().map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Hold Ctrl (Windows) or Command (Mac) to select multiple authors
              </p>
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

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <MarkdownEditor
                value={formData.content}
                onChange={handleContentChange}
              />
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
              <p className="mt-1 text-sm text-gray-500">
                This will be used as the meta description for SEO. If left empty, it will be automatically generated from the content.
              </p>
            </div>

            {/* Main Image */}
            <div>
              <ImageUploader
                selectedImage={imageFile}
                imageAlt={formData.imageAlt}
                onImageChange={handleImageChange}
                onImageAltChange={(alt) => setFormData(prev => ({ ...prev, imageAlt: alt }))}
                currentImageUrl={formData.imageUrlPromise || ''}
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