export interface WaitlistEntry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  mailing_list: boolean;
  category: string;
  linkedin?: string | null;
} 