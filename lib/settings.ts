import { supabaseAdmin } from './supabase';

type CacheEntry = { value?: string; expiresAt: number };
const cache: Map<string, CacheEntry> = new Map();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getAppSettingRaw(key: string): Promise<string | undefined> {
  const { data, error } = await supabaseAdmin
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .single();
  if (error) {
    // Silently ignore read errors and fall back to envs/caller defaults
    return undefined;
  }
  return data?.value ?? undefined;
}

export async function getAppSetting(
  key: string,
  options?: { ttlMs?: number }
): Promise<string | undefined> {
  const ttl = options?.ttlMs ?? DEFAULT_TTL_MS;
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }
  const value = await getAppSettingRaw(key);
  cache.set(key, { value, expiresAt: now + ttl });
  return value;
}

export async function getSlackInviteLink(): Promise<string | undefined> {
  // DB setting takes precedence over env. Caller may still override explicitly.
  const fromDb = await getAppSetting('slack_invite_link');
  if (fromDb && fromDb.trim().length > 0) {
    return fromDb;
  }
  return process.env.SLACK_INVITE_LINK;
}


