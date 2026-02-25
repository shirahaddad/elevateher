export interface WaitlistEntry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  mailing_list: boolean;
  category: string;
  linkedin?: string | null;
  workshop_id?: number | null;
  /** Populated by admin API when category is workshop-registration */
  workshops?: { title: string; slug: string } | null;
} 