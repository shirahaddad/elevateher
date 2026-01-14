'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Workshop = {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content_md?: string;
  start_at?: string;
  location?: string;
  registration_url?: string;
  status: 'NEXT' | 'FUTURE' | 'PAST';
  hero_image_key?: string;
  resources?: { id: number; name: string; kind?: 'FILE' | 'URL' | 'TEXT'; s3_key?: string; value?: string; mime_type?: string }[];
};

export default function EditWorkshopPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<Partial<Workshop>>({});
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/workshops/${id}`, { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed to load workshop');
        setForm(json.data);
        // Derive date/time from start_at in America/New_York (EST display)
        if (json.data?.start_at && typeof json.data.start_at === 'string') {
          const d = new Date(json.data.start_at);
          const nyDate = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(d); // YYYY-MM-DD
          const nyTime = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'America/New_York',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
          }).format(d); // HH:MM
          setDate(nyDate);
          setTime(nyTime);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id) return;
    setSaving(true);
    setError(null);
    try {
      const start_at = date && time ? `${date}T${time}:00-05:00` : null;
      const res = await fetch(`/api/admin/workshops/${form.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          start_at,
          location: undefined, // omit location; all virtual
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to update workshop');
      router.push('/admin/workshops');
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const [resForm, setResForm] = useState<{ name: string; kind: 'FILE' | 'URL' | 'TEXT'; file?: File | null; value?: string }>({
    name: '',
    kind: 'FILE',
    file: null,
    value: '',
  });
  const addResource = async () => {
    setError(null);
    try {
      let payload: any = { name: resForm.name, kind: resForm.kind };
      if (resForm.kind === 'FILE') {
        if (!resForm.file) throw new Error('Please choose a file');
        const fd = new FormData();
        fd.append('file', resForm.file);
        const upload = await fetch(`/api/admin/workshops/${form.id}/resources/upload`, {
          method: 'POST',
          body: fd,
        });
        const ujson = await upload.json();
        if (!upload.ok) throw new Error(ujson?.error || 'Upload failed');
        payload.s3_key = ujson.s3_key;
        payload.mime_type = ujson.mime_type;
      } else {
        if (!resForm.value) throw new Error('Please enter a value');
        payload.value = resForm.value;
      }

      const res = await fetch(`/api/admin/workshops/${form.id}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to add resource');
      // refresh
      const refreshed = await fetch(`/api/admin/workshops/${id}`, { cache: 'no-store' }).then(r => r.json());
      setForm(refreshed.data);
      setResForm({ name: '', kind: 'FILE', file: null, value: '' });
    } catch (e: any) {
      setError(e.message || 'Failed to add resource');
    }
  };

  const removeResource = async (resourceId: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/workshops/${form.id}/resources`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to delete resource');
      const refreshed = await fetch(`/api/admin/workshops/${id}`, { cache: 'no-store' }).then(r => r.json());
      setForm(refreshed.data);
    } catch (e: any) {
      setError(e.message || 'Failed to delete resource');
    }
  };

  if (loading) return <div className="min-h-screen py-16 bg-white"><div className="max-w-7xl mx-auto px-4">Loading...</div></div>;

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
      <h1 className="text-4xl font-bold text-purple-900 mb-6">Edit Workshop</h1>
      <form onSubmit={onSubmit} className="space-y-4 max-w-3xl">
        <div>
          <label className="block text-sm mb-1 text-gray-800">Title</label>
          <input name="title" value={form.title || ''} onChange={onChange} className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-800">Slug</label>
          <input name="slug" value={form.slug || ''} onChange={onChange} className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-800">Summary</label>
          <textarea name="summary" value={form.summary || ''} onChange={onChange} className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2" rows={3} />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-800">Content (Markdown)</label>
          <textarea name="content_md" value={form.content_md || ''} onChange={onChange} className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2" rows={8} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-gray-800">Date (EST)</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-800">Time (EST)</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-800">Registration URL</label>
          <input name="registration_url" value={form.registration_url || ''} onChange={onChange} className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-gray-800">Status</label>
            <select name="status" value={form.status || 'FUTURE'} onChange={onChange} className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2">
              <option value="FUTURE">FUTURE</option>
              <option value="PAST">PAST</option>
              <option value="NEXT">NEXT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-800">Hero Image S3 Key</label>
            <input name="hero_image_key" value={form.hero_image_key || ''} onChange={onChange} className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2" />
          </div>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex gap-2">
          <button disabled={saving} className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>

      <div className="mt-8 max-w-3xl">
        <h2 className="text-xl font-semibold mb-2 text-purple-700">Resources</h2>
        <div className="space-y-2">
          {(form.resources || []).map((r) => (
            <div key={r.id} className="flex items-center justify-between border rounded px-3 py-2">
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {r.name}{' '}
                  {r.kind && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border">{r.kind}</span>
                  )}
                </div>
                <div className="text-sm text-gray-900 break-all">
                  {r.kind === 'URL' && r.value ? (
                    <a href={r.value} target="_blank" rel="noreferrer" className="text-purple-700 hover:text-purple-900 underline">
                      {r.value}
                    </a>
                  ) : r.kind === 'TEXT' ? (
                    <span>{r.value}</span>
                  ) : (
                    <span className="text-gray-700">{r.s3_key}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {r.kind === 'FILE' && r.s3_key && (
                  <button
                    onClick={async () => {
                      try {
                        const presign = await fetch(`/api/admin/workshops/${form.id}/resources/presign`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ s3_key: r.s3_key }),
                        });
                        const data = await presign.json();
                        if (!presign.ok) throw new Error(data?.error || 'Failed to get URL');
                        window.open(data.url, '_blank');
                      } catch (e) {
                        console.error(e);
                        alert('Failed to open file');
                      }
                    }}
                    className="px-2 py-1 rounded-md border border-gray-300 text-gray-900 hover:bg-gray-50"
                    title="Open"
                  >
                    Open
                  </button>
                )}
                <button
                  onClick={() => removeResource(r.id)}
                  className="px-2 py-1 rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 border rounded p-3 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              placeholder="Name"
              className="border border-gray-300 text-gray-900 rounded px-2 py-1"
              value={resForm.name}
              onChange={(e) => setResForm((p) => ({ ...p, name: e.target.value }))}
            />
            <select
              className="border border-gray-300 text-gray-900 rounded px-2 py-1"
              value={resForm.kind}
              onChange={(e) => setResForm((p) => ({ ...p, kind: e.target.value as any, file: null, value: '' }))}
            >
              <option value="FILE">File</option>
              <option value="URL">URL</option>
              <option value="TEXT">Text</option>
            </select>
            {resForm.kind === 'FILE' ? (
              <input
                key="file-input"
                type="file"
                className="border border-gray-300 text-gray-900 rounded px-2 py-1"
                onChange={(e) => setResForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
              />
            ) : (
              <input
                key={`value-input-${resForm.kind}`}
                placeholder={resForm.kind === 'URL' ? 'https://...' : 'Free text value'}
                className="border border-gray-300 text-gray-900 rounded px-2 py-1"
                value={resForm.value}
                onChange={(e) => setResForm((p) => ({ ...p, value: e.target.value }))}
              />
            )}
          </div>
          <button onClick={addResource} className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors">
            Add Resource
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

