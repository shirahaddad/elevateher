import { supabaseAdmin, withConnectionTracking } from '@/lib/supabase';
import { ApiException } from '@/lib/api/utils/error-handler';
import appCache from '@/lib/cache';
import {
  BlogPost,
  BlogPostFilters,
  CreateBlogPostInput,
  UpdateBlogPostInput,
  Tag,
} from '../../types/blog';
import { PaginationParams } from '../../types/common';
import { getS3Url } from '@/lib/s3Utils';
import { ApplicationCache } from '@/lib/cache';

interface PostTag {
  tag_id: string;
  tags: Tag;
}

interface PostWithTags extends BlogPost {
  post_tags: PostTag[];
}

export class BlogPostService {
  private static instance: BlogPostService;

  private constructor() {}

  public static getInstance(): BlogPostService {
    if (!BlogPostService.instance) {
      BlogPostService.instance = new BlogPostService();
    }
    return BlogPostService.instance;
  }

  async getPosts(filters?: BlogPostFilters & PaginationParams) {
    return withConnectionTracking(async () => {
      try {
        const page = filters?.page || 1;
        const limit = filters?.limit || 10;
        const offset = (page - 1) * limit;

        // Generate cache key
        const cacheKey = ApplicationCache.generateKey('blog_posts', {
          tag: filters?.tag,
          is_published: filters?.is_published,
          author: filters?.author,
          page,
          limit
        });

        // Try to get from cache first
        const cached = appCache.get(cacheKey);
        if (cached) {
          return cached;
        }

        // Build the main query
        let query = supabaseAdmin
          .from('posts')
          .select(`
            *,
            post_tags!inner (
              tag_id,
              tags!inner (
                name
              )
            )
          `, { count: 'exact' })
          .order('published_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (filters?.tag) {
          query = query.eq('post_tags.tags.name', filters.tag);
        }

        if (filters?.is_published !== undefined) {
          query = query.eq('is_published', filters.is_published);
        }

        if (filters?.author) {
          query = query.eq('author_name', filters.author);
        }

        const { data, error, count } = await query;

        if (error) {
          throw new ApiException(
            'DATABASE_ERROR',
            'Failed to fetch blog posts',
            500,
            error
          );
        }

        const posts = data.map((post: PostWithTags) => ({
          ...post,
          tags: post.post_tags?.map((pt: PostTag) => pt.tags) || []
        })) as BlogPost[];

        const result = {
          data: posts,
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit)
        };

        // Cache the result for 5 minutes (300,000 ms)
        appCache.set(cacheKey, result, 5 * 60 * 1000);

        return result;
      } catch (error) {
        if (error instanceof ApiException) throw error;
        throw new ApiException(
          'INTERNAL_ERROR',
          'Failed to fetch blog posts',
          500,
          error
        );
      }
    });
  }

  async getPostBySlug(slug: string) {
    return withConnectionTracking(async () => {
      try {
        // Generate cache key
        const cacheKey = ApplicationCache.generateKey('blog_post', { slug });

        // Try to get from cache first
        const cached = appCache.get(cacheKey);
        if (cached) {
          return cached;
        }

        const { data, error } = await supabaseAdmin
          .from('posts')
          .select(`
            *,
            post_tags!inner (
              tags!inner (
                name
              )
            )
          `)
          .eq('slug', slug)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new ApiException('NOT_FOUND', 'Post not found', 404);
          }
          throw new ApiException(
            'DATABASE_ERROR',
            'Failed to fetch blog post',
            500,
            error
          );
        }

        // Generate S3 URL if needed
        if (data.image_url && !data.image_url.startsWith('http')) {
          data.image_url = await getS3Url(data.image_url);
        }

        const result = {
          ...data,
          tags: data.post_tags?.map((pt: PostTag) => pt.tags?.name).filter(Boolean) || []
        } as BlogPost;

        // Cache the result for 1 hour (3,600,000 ms)
        appCache.set(cacheKey, result, 60 * 60 * 1000);

        return result;
      } catch (error) {
        if (error instanceof ApiException) throw error;
        throw new ApiException(
          'INTERNAL_ERROR',
          'Failed to fetch blog post',
          500,
          error
        );
      }
    });
  }

  async createPost(input: CreateBlogPostInput) {
    return withConnectionTracking(async () => {
      try {
        const { data: post, error } = await supabaseAdmin
          .from('posts')
          .insert([
            {
              title: input.title,
              content: input.content,
              excerpt: input.excerpt,
              author_name: input.author_name,
              slug: this.generateSlug(input.title),
              is_published: input.is_published || false,
              image_url: input.image_url,
              image_alt: input.image_alt,
              published_at: input.is_published ? new Date().toISOString() : null,
            }
          ])
          .select()
          .single();

        if (error) {
          throw new ApiException(
            'DATABASE_ERROR',
            'Failed to create blog post',
            500,
            error
          );
        }

        if (input.tags?.length) {
          await this.updatePostTags(post.id, input.tags);
        }

        // Invalidate cache for blog posts lists
        await this.invalidateBlogCache();

        return post as BlogPost;
      } catch (error) {
        if (error instanceof ApiException) throw error;
        throw new ApiException(
          'INTERNAL_ERROR',
          'Failed to create blog post',
          500,
          error
        );
      }
    });
  }

  async updatePost(input: UpdateBlogPostInput) {
    return withConnectionTracking(async () => {
      try {
        const { data: post, error } = await supabaseAdmin
          .from('posts')
          .update({
            title: input.title,
            content: input.content,
            excerpt: input.excerpt,
            author_name: input.author_name,
            slug: input.title ? this.generateSlug(input.title) : undefined,
            is_published: input.is_published,
            image_url: input.image_url,
            image_alt: input.image_alt,
            published_at: input.is_published ? new Date().toISOString() : null,
          })
          .eq('id', input.id)
          .select()
          .single();

        if (error) {
          throw new ApiException(
            'DATABASE_ERROR',
            'Failed to update blog post',
            500,
            error
          );
        }

        if (input.tags) {
          await this.updatePostTags(input.id, input.tags);
        }

        // Invalidate cache for blog posts lists and this specific post
        await this.invalidateBlogCache();
        appCache.delete(ApplicationCache.generateKey('blog_post', { slug: post.slug }));

        return post as BlogPost;
      } catch (error) {
        if (error instanceof ApiException) throw error;
        throw new ApiException(
          'INTERNAL_ERROR',
          'Failed to update blog post',
          500,
          error
        );
      }
    });
  }

  async deletePost(id: string) {
    return withConnectionTracking(async () => {
      try {
        // Get the post slug before deleting for cache invalidation
        const { data: post } = await supabaseAdmin
          .from('posts')
          .select('slug')
          .eq('id', id)
          .single();

        const { error } = await supabaseAdmin
          .from('posts')
          .delete()
          .eq('id', id);

        if (error) {
          throw new ApiException(
            'DATABASE_ERROR',
            'Failed to delete blog post',
            500,
            error
          );
        }

        // Invalidate cache for blog posts lists and this specific post
        await this.invalidateBlogCache();
        if (post?.slug) {
          appCache.delete(ApplicationCache.generateKey('blog_post', { slug: post.slug }));
        }
      } catch (error) {
        if (error instanceof ApiException) throw error;
        throw new ApiException(
          'INTERNAL_ERROR',
          'Failed to delete blog post',
          500,
          error
        );
      }
    });
  }

  private async updatePostTags(postId: string, tagIds: string[]) {
    return withConnectionTracking(async () => {
      try {
        // Delete existing tags
        await supabaseAdmin
          .from('post_tags')
          .delete()
          .eq('post_id', postId);

        // Insert new tags
        if (tagIds.length > 0) {
          const { error } = await supabaseAdmin
            .from('post_tags')
            .insert(tagIds.map(tagId => ({
              post_id: postId,
              tag_id: tagId
            })));

          if (error) {
            throw new ApiException(
              'DATABASE_ERROR',
              'Failed to update post tags',
              500,
              error
            );
          }
        }
      } catch (error) {
        if (error instanceof ApiException) throw error;
        throw new ApiException(
          'INTERNAL_ERROR',
          'Failed to update post tags',
          500,
          error
        );
      }
    });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Invalidate all blog-related cache entries
   */
  private async invalidateBlogCache() {
    try {
      // Call the cache invalidation endpoint
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      await fetch(`${baseUrl}/api/admin/cache`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'all' }),
      });
    } catch (error) {
      console.error('Failed to invalidate cache via endpoint:', error);
      // Fallback to direct cache invalidation
      const stats = appCache.getStats();
      stats.keys.forEach(key => {
        if (key.startsWith('blog_posts:') || key.startsWith('blog_post:')) {
          appCache.delete(key);
        }
      });
    }
  }
} 