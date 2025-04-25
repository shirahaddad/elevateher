export interface Submission {
  id: string;
  created_at: string;
  email: string;
  client_name: string | null;
  goals: string;
  skills: string[];
  other_skill: string | null;
  time_commitment: string;
  linkedin: string | null;
  additional_info: string | null;
  mailing_list: boolean;
  processed: boolean;
  source: string | null;
} 