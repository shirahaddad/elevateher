import { ApiResponse, PaginatedResponse } from './common';

export type WorkshopStatus = 'NEXT' | 'FUTURE' | 'PAST';

export interface Workshop {
  id: number;
  slug: string;
  title: string;
  summary?: string;
  content_md?: string;
  start_at?: string; // ISO string
  location?: string;
  registration_url?: string;
  status: WorkshopStatus;
  hero_image_key?: string;
  resource_password_hash?: string | null; // captured but not enforced yet
  created_at: string;
  updated_at: string;
  resources?: WorkshopResource[];
}

export interface WorkshopResource {
  id: number;
  workshop_id: number;
  name: string;
  kind?: 'FILE' | 'URL' | 'TEXT';
  s3_key?: string;
  value?: string;
  mime_type?: string;
  created_at: string;
}

export interface CreateWorkshopInput {
  title: string;
  slug?: string;
  summary?: string;
  content_md?: string;
  start_at?: string;
  location?: string;
  registration_url?: string;
  status?: WorkshopStatus; // default FUTURE
  hero_image_key?: string;
  resource_password?: string; // plain text; hash server-side if provided (deferred)
}

export interface UpdateWorkshopInput extends Partial<CreateWorkshopInput> {
  id: number;
}

export interface WorkshopsResponse extends ApiResponse<PaginatedResponse<Workshop>> {}
export interface WorkshopResponse extends ApiResponse<Workshop> {}
export interface WorkshopResourcesResponse extends ApiResponse<WorkshopResource[]> {}

