import { ApiResponse, PaginatedResponse } from './common';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author_name: string;
  is_published: boolean;
  image_url?: string;
  image_alt?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  name: string;
}

export interface CreateBlogPostInput {
  title: string;
  content: string;
  excerpt?: string;
  author_name: string;
  is_published?: boolean;
  image_url?: string;
  image_alt?: string;
  tags?: string[];
}

export interface UpdateBlogPostInput extends Partial<CreateBlogPostInput> {
  id: string;
}

export interface BlogPostResponse extends ApiResponse<BlogPost> {}
export interface BlogPostsResponse extends ApiResponse<PaginatedResponse<BlogPost>> {}
export interface TagsResponse extends ApiResponse<Tag[]> {}

export interface BlogPostFilters {
  tag?: string;
  author?: string;
  is_published?: boolean;
  search?: string;
} 