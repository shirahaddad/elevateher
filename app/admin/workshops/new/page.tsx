'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Convert a New York local date+time to an ISO UTC string, DST-safe.
function getOffsetMs(timeZone: string, epochMs: number): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = dtf.formatToParts(new Date(epochMs));
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );
  // asUtc - epochMs equals the zone offset in ms at epochMs
  return asUtc - epochMs;
}

function nyLocalToUtcIso(dateStr: string, timeStr: string): string | null {
  if (!dateStr || !timeStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  // Initial guess: interpret wall time as if it were UTC
  const guess = Date.UTC(y, m - 1, d, hh, mm, 0);
  const tz = 'America/New_York';
  let offset = getOffsetMs(tz, guess);
  let utc = guess - offset;
  // Re-evaluate once to handle transitions around DST boundaries
  const offset2 = getOffsetMs(tz, utc);
  if (offset2 !== offset) {
    utc = guess - offset2;
  }
  return new Date(utc).toISOString();
}

export default function NewWorkshopPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    slug: '',
    summary: '',
    content_md: '',
    date: '',
    time: '',
    registration_url: '',
    status: 'FUTURE',
    hero_image_key: '',
    resource_password: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const start_at = nyLocalToUtcIso(form.date, form.time);

      const res = await fetch('/api/admin/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug || undefined,
          summary: form.summary || undefined,
          content_md: form.content_md || undefined,
          start_at,
          // location omitted (all virtual)
          registration_url: form.registration_url || undefined,
          status: form.status,
          hero_image_key: form.hero_image_key || undefined,
          resource_password: form.resource_password || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to create workshop');
      router.push('/admin/workshops');
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-4">
          <Link
            href="/admin/workshops"
            className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Workshops
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-purple-900 mb-6">New Workshop</h1>
        <form onSubmit={onSubmit} className="space-y-4 max-w-3xl">
        <div>
          <label className="block text-sm mb-1 text-gray-800">Title</label>
          <input name="title" value={form.title} onChange={onChange} className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-800">Slug (optional)</label>
          <input name="slug" value={form.slug} onChange={onChange} className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-800">Summary</label>
          <textarea name="summary" value={form.summary} onChange={onChange} className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2" rows={3} />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-800">Content (Markdown)</label>
          <textarea name="content_md" value={form.content_md} onChange={onChange} className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2" rows={8} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-gray-800">Date (ET)</label>
            <input type="date" name="date" value={form.date} onChange={onChange} className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-800">Time (ET)</label>
            <input type="time" name="time" value={form.time} onChange={onChange} className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-800">Registration URL</label>
          <input name="registration_url" value={form.registration_url} onChange={onChange} className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-gray-800">Status</label>
            <select name="status" value={form.status} onChange={onChange} className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2">
              <option value="FUTURE">FUTURE</option>
              <option value="PAST">PAST</option>
              <option value="NEXT">NEXT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-800">Hero Image S3 Key</label>
            <input name="hero_image_key" value={form.hero_image_key} onChange={onChange} className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2" placeholder="workshops/slug/hero.jpg" />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-800">Resource Password (stored, not enforced)</label>
          <input name="resource_password" value={form.resource_password} onChange={onChange} className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2" />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex gap-2">
          <button disabled={saving} className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => router.push('/admin/workshops')} className="px-4 py-2 rounded-md border border-gray-300 text-gray-900 hover:bg-gray-50">
            Cancel
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}

