// Base Types

export interface Author {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_name: string;
  publishedAt: string;
  updatedAt: string;
  is_published: boolean;
  coverImage?: string;
  seoDescription?: string;
}

// Combined Types

export interface PostWithAuthor extends Post {
  author: Author;
}

export interface PostWithTags extends Post {
  tags: Tag[];
}

export interface FullPost extends PostWithAuthor {
  tags: Tag[];
}

// API Request Types

export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt: string;
  author_name: string;
  is_published?: boolean;
  tags?: string[]; // Array of tag IDs
  coverImage?: string;
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
  sortBy?: 'publishedAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
} 