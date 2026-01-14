import { supabaseAdmin, withConnectionTracking } from '@/lib/supabase';
import appCache, { ApplicationCache } from '@/lib/cache';
import { getS3Url } from '@/lib/s3Utils';
import {
  Workshop,
  WorkshopResource,
  WorkshopStatus,
  CreateWorkshopInput,
  UpdateWorkshopInput,
} from '@/lib/api/types/workshop';
import { PaginationParams } from '@/lib/api/types/common';

export class WorkshopService {
  private static instance: WorkshopService;
  private constructor() {}

  public static getInstance(): WorkshopService {
    if (!WorkshopService.instance) {
      WorkshopService.instance = new WorkshopService();
    }
    return WorkshopService.instance;
  }

  // PUBLIC METHODS
  async getNextWorkshop() {
    return withConnectionTracking(async () => {
      const cacheKey = ApplicationCache.generateKey('workshop_next');
      const cached = appCache.get<Workshop | null>(cacheKey);
      if (cached !== null) return cached;

      const { data, error } = await supabaseAdmin
        .from('workshops')
        .select('*')
        .eq('status', 'NEXT')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch NEXT workshop: ${error.message}`);
      }

      if (data?.hero_image_key) {
        data.hero_image_key = await getS3Url(data.hero_image_key);
      }

      appCache.set(cacheKey, data ?? null, 5 * 60 * 1000);
      return data as Workshop | null;
    });
  }

  async getWorkshopBySlug(slug: string) {
    return withConnectionTracking(async () => {
      const cacheKey = ApplicationCache.generateKey('workshop_by_slug', { slug });
      const cached = appCache.get<Workshop>(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabaseAdmin
        .from('workshops')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw Object.assign(new Error('Workshop not found'), { status: 404 });
        }
        throw new Error(`Failed to fetch workshop: ${error.message}`);
      }

      if (data.hero_image_key) {
        data.hero_image_key = await getS3Url(data.hero_image_key);
      }

      // Fetch resources
      const { data: resources, error: resError } = await supabaseAdmin
        .from('workshop_resources')
        .select('*')
        .eq('workshop_id', data.id)
        .order('created_at', { ascending: false });

      if (resError) {
        throw new Error(`Failed to fetch workshop resources: ${resError.message}`);
      }

      const result = { ...(data as Workshop), resources: resources as WorkshopResource[] };
      appCache.set(cacheKey, result, 60 * 60 * 1000);
      return result;
    });
  }

  async getById(id: number) {
    return withConnectionTracking(async () => {
      const { data, error } = await supabaseAdmin
        .from('workshops')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw Object.assign(new Error('Workshop not found'), { status: 404 });
        }
        throw new Error(`Failed to fetch workshop by id: ${error.message}`);
      }

      if (data.hero_image_key) {
        data.hero_image_key = await getS3Url(data.hero_image_key);
      }

      const { data: resources, error: resError } = await supabaseAdmin
        .from('workshop_resources')
        .select('*')
        .eq('workshop_id', data.id)
        .order('created_at', { ascending: false });

      if (resError) {
        throw new Error(`Failed to fetch workshop resources: ${resError.message}`);
      }

      return { ...(data as Workshop), resources: resources as WorkshopResource[] };
    });
  }

  async listPastWorkshops(params?: PaginationParams) {
    return withConnectionTracking(async () => {
      const page = params?.page || 1;
      const limit = params?.limit || 12;
      const offset = (page - 1) * limit;

      const cacheKey = ApplicationCache.generateKey('workshops_past', { page, limit });
      const cached = appCache.get(cacheKey);
      if (cached) return cached;

      const { data, error, count } = await supabaseAdmin
        .from('workshops')
        .select('*', { count: 'exact' })
        .eq('status', 'PAST')
        .order('start_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to list past workshops: ${error.message}`);
      }

      const transformed = await Promise.all(
        (data as Workshop[]).map(async (w) => ({
          ...w,
          hero_image_key: w.hero_image_key ? await getS3Url(w.hero_image_key) : undefined,
        }))
      );

      const result = {
        data: transformed,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
      appCache.set(cacheKey, result, 60 * 1000);
      return result;
    });
  }

  // ADMIN METHODS
  async listAll(params?: PaginationParams & { status?: WorkshopStatus }) {
    return withConnectionTracking(async () => {
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const offset = (page - 1) * limit;

      let query = supabaseAdmin
        .from('workshops')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (params?.status) {
        query = query.eq('status', params.status);
      }

      const { data, error, count } = await query;
      if (error) {
        throw new Error(`Failed to list workshops: ${error.message}`);
      }

      return {
        data: data as Workshop[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    });
  }

  async create(input: CreateWorkshopInput) {
    return withConnectionTracking(async () => {
      const payload = {
        title: input.title,
        slug: input.slug || this.generateSlug(input.title),
        summary: input.summary,
        content_md: input.content_md,
        start_at: input.start_at || null,
        location: input.location,
        registration_url: input.registration_url,
        status: input.status || ('FUTURE' as WorkshopStatus),
        hero_image_key: input.hero_image_key,
        // Store plaintext per product decision (marketing gate only)
        resource_password_hash: input.resource_password?.trim() || null,
      };

      const { data, error } = await supabaseAdmin
        .from('workshops')
        .insert([payload])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create workshop: ${error.message}`);
      }

      this.invalidateCaches();
      return data as Workshop;
    });
  }

  async update(input: UpdateWorkshopInput) {
    return withConnectionTracking(async () => {
      const updates: any = {
        title: input.title,
        summary: input.summary,
        content_md: input.content_md,
        start_at: input.start_at,
        location: input.location,
        registration_url: input.registration_url,
        status: input.status,
      };

      // Only update hero_image_key when explicitly provided
      if (input.hero_image_key !== undefined) {
        updates.hero_image_key = input.hero_image_key;
      }

      if (input.resource_password !== undefined) {
        updates.resource_password_hash = input.resource_password?.trim() || null;
      }

      if (input.title && !input.slug) {
        updates.slug = this.generateSlug(input.title);
      } else if (input.slug) {
        updates.slug = input.slug;
      }

      const { data, error } = await supabaseAdmin
        .from('workshops')
        .update(updates)
        .eq('id', input.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update workshop: ${error.message}`);
      }

      this.invalidateCaches();
      return data as Workshop;
    });
  }

  async delete(id: number) {
    return withConnectionTracking(async () => {
      const { error } = await supabaseAdmin.from('workshops').delete().eq('id', id);
      if (error) {
        throw new Error(`Failed to delete workshop: ${error.message}`);
      }
      this.invalidateCaches();
    });
  }

  async setNext(id: number) {
    return withConnectionTracking(async () => {
      // Demote any current NEXT to PAST
      const { error: demoteErr } = await supabaseAdmin
        .from('workshops')
        .update({ status: 'PAST' })
        .eq('status', 'NEXT');
      if (demoteErr) {
        throw new Error(`Failed to demote current NEXT workshop: ${demoteErr.message}`);
      }
      // Promote selected to NEXT
      const { error: promoteErr } = await supabaseAdmin
        .from('workshops')
        .update({ status: 'NEXT' })
        .eq('id', id);
      if (promoteErr) {
        throw new Error(`Failed to set NEXT workshop: ${promoteErr.message}`);
      }
      this.invalidateCaches();
    });
  }

  async addResource(workshopId: number, resource: Omit<WorkshopResource, 'id' | 'created_at'>) {
    return withConnectionTracking(async () => {
      const { data, error } = await supabaseAdmin
        .from('workshop_resources')
        .insert([
          {
            workshop_id: workshopId,
            name: resource.name,
            kind: resource.kind || 'FILE',
            s3_key: resource.s3_key || null,
            value: resource.value || null,
            mime_type: resource.mime_type,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add resource: ${error.message}`);
      }
      // Invalidate caches of the specific workshop
      appCache.delete(ApplicationCache.generateKey('workshop_by_slug', { slug: (await this.getWorkshopSlugById(workshopId)) }));
      return data as WorkshopResource;
    });
  }

  async removeResource(resourceId: number) {
    return withConnectionTracking(async () => {
      const { error } = await supabaseAdmin.from('workshop_resources').delete().eq('id', resourceId);
      if (error) {
        throw new Error(`Failed to remove resource: ${error.message}`);
      }
    });
  }

  // HELPERS
  private generateSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  private invalidateCaches() {
    // Remove all workshop-related keys
    const stats = appCache.getStats();
    stats.keys.forEach((key) => {
      if (
        key.startsWith('workshop_next') ||
        key.startsWith('workshop_by_slug:') ||
        key.startsWith('workshops_past:')
      ) {
        appCache.delete(key);
      }
    });
  }

  private async getWorkshopSlugById(id: number): Promise<string | undefined> {
    const { data } = await supabaseAdmin.from('workshops').select('slug').eq('id', id).single();
    return data?.slug;
  }
}

export const workshopService = WorkshopService.getInstance();

