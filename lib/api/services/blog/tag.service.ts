import { supabaseAdmin } from '@/lib/supabase';
import { ApiException } from '../../utils/error-handler';
import { Tag } from '../../types/blog';

export class TagService {
  private static instance: TagService;

  private constructor() {}

  public static getInstance(): TagService {
    if (!TagService.instance) {
      TagService.instance = new TagService();
    }
    return TagService.instance;
  }

  async getTags() {
    try {
      const { data, error } = await supabaseAdmin
        .from('tags')
        .select(`
          *,
          post_tags!inner (
            post_id,
            posts!inner (
              is_published
            )
          )
        `)
        .eq('post_tags.posts.is_published', true)
        .order('name', { ascending: true });

      if (error) {
        throw new ApiException(
          'DATABASE_ERROR',
          'Failed to fetch tags',
          500,
          error
        );
      }

      // Remove duplicates and return unique tags
      const uniqueTags = Array.from(new Set(data.map(tag => tag.name)))
        .map(name => data.find(tag => tag.name === name))
        .filter((tag): tag is Tag => tag !== undefined);

      return uniqueTags;
    } catch (error) {
      if (error instanceof ApiException) throw error;
      throw new ApiException(
        'INTERNAL_ERROR',
        'Failed to fetch tags',
        500,
        error
      );
    }
  }

  async createTag(name: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('tags')
        .insert([{ name }])
        .select()
        .single();

      if (error) {
        throw new ApiException(
          'DATABASE_ERROR',
          'Failed to create tag',
          500,
          error
        );
      }

      return data as Tag;
    } catch (error) {
      if (error instanceof ApiException) throw error;
      throw new ApiException(
        'INTERNAL_ERROR',
        'Failed to create tag',
        500,
        error
      );
    }
  }

  async updateTag(id: string, name: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('tags')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new ApiException(
          'DATABASE_ERROR',
          'Failed to update tag',
          500,
          error
        );
      }

      return data as Tag;
    } catch (error) {
      if (error instanceof ApiException) throw error;
      throw new ApiException(
        'INTERNAL_ERROR',
        'Failed to update tag',
        500,
        error
      );
    }
  }

  async deleteTag(id: string) {
    try {
      const { error } = await supabaseAdmin
        .from('tags')
        .delete()
        .eq('id', id);

      if (error) {
        throw new ApiException(
          'DATABASE_ERROR',
          'Failed to delete tag',
          500,
          error
        );
      }
    } catch (error) {
      if (error instanceof ApiException) throw error;
      throw new ApiException(
        'INTERNAL_ERROR',
        'Failed to delete tag',
        500,
        error
      );
    }
  }
} 