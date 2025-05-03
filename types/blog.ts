/**
 * @file blog.ts
 * @description Type definitions for blog-related components and data structures
 */

// Base Types

export interface Author {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

/**
 * @interface Tag
 * @description Represents a blog post tag with its unique identifier and display name
 */
export interface Tag {
  id: string;
  name: string;
}

/**
 * @interface BlogPostData
 * @description Data structure for a blog post
 */
export interface BlogPostData {
  id?: string | number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_name: string;
  tags: string[];
  is_published: boolean;
  imageUrl?: string;
  imageAlt?: string;
}

/**
 * @interface Post
 * @description Represents a blog post
 */
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_name: string;
  published_at: string;
  updatedAt: string;
  is_published: boolean;
  image_url?: string;
  image_alt?: string;
  seoDescription?: string;
}

export interface ApiPost extends Post {
  content: string;
  updatedAt: string;
  is_published: boolean;
  author: Author;
  post_tags: {
    tag: Tag;
  }[];
}

// Combined Types

export interface PostWithAuthor extends Post {
  author: Author;
}

export interface PostWithTags extends Post {
  tags: Tag[];
}

export interface FullPost extends PostWithAuthor {
  tags: string[];
}

// API Request Types

export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt: string;
  author_name: string;
  is_published?: boolean;
  tags?: string[]; // Array of tag IDs
  imageUrl?: string;
  seoDescription?: string;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  id: string;
}

// API Response Types

export interface ListPostsResponse {
  posts: FullPost[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface GetPostResponse {
  post: FullPost;
}

export interface CreatePostResponse {
  post: FullPost;
}

export interface UpdatePostResponse {
  post: FullPost;
}

export interface DeletePostResponse {
  success: boolean;
  id: string;
}

// Query Parameters

export interface PostFilters {
  author_name?: string;
  tagId?: string;
  is_published?: boolean;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: 'published_at' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * @interface BlogPostFormProps
 * @description Props for the BlogPostForm component
 * @property {('create' | 'edit')} mode - Determines whether the form is for creating or editing a post
 * @property {BlogPostData} [initialData] - Optional initial data for editing an existing post
 */
export interface BlogPostFormProps {
  mode: 'create' | 'edit';
  initialData?: BlogPostData;
}

export interface BlogPostFormState {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_name: string;
  tags: string[];
  is_published: boolean;
  imageUrl: string;
  imageAlt: string;
  imageKey: string;
  originalImageKey: string;
  imageUrlPromise?: Promise<string>;
} 