'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import FileUpload from '@/components/common/FileUpload';

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
  resource_password_hash?: string | null;
  resources?: { id: number; name: string; kind?: 'FILE' | 'URL' | 'TEXT'; s3_key?: string; value?: string; mime_type?: string }[];
};

export default function EditWorkshopPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<Partial<Workshop>>({});
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [passkey, setPasskey] = useState('');
  const [heroKey, setHeroKey] = useState<string | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [heroFileName, setHeroFileName] = useState<string | null>(null);
  const uploadSeqRef = useRef(0); // Tracks latest selected file to avoid race updates
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
        // Initialize passkey view with saved value (plaintext)
        if (json.data?.resource_password_hash) {
          setPasskey(json.data.resource_password_hash);
        } else {
          setPasskey('');
        }
        // Initialize hero preview (form.hero_image_key may already be a full URL)
        if (json.data?.hero_image_key) {
          setHeroPreview(json.data.hero_image_key);
          try {
            const fromUrl = json.data.hero_image_key as string;
            const name = fromUrl.split('?')[0].split('/').pop() || null;
            setHeroFileName(name);
          } catch {
            setHeroFileName(null);
          }
          // Bug 1: Initialize heroKey with existing S3 key (derived from URL) to preserve on save
          try {
            const urlStr = json.data.hero_image_key as string;
            let key: string | null = null;
            try {
              const u = new URL(urlStr);
              key = u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname;
            } catch {
              // Fallback: split on common S3 domain separator
              const idx = urlStr.indexOf('.amazonaws.com/');
              if (idx !== -1) key = urlStr.slice(idx + '.amazonaws.com/'.length);
            }
            if (key) {
              setHeroKey(key);
            } else {
              // Bug 1 fallback: preserve original value if extraction failed
              setHeroKey(json.data.hero_image_key);
            }
          } catch {
            // Final fallback: preserve original value
            setHeroKey(json.data.hero_image_key);
          }
        }
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
          // To clear: leave field empty; to set/replace: enter a value
          resource_password: passkey !== undefined ? passkey : undefined,
          hero_image_key: heroKey ?? undefined,
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
        const contentType = upload.headers.get('content-type') || '';
        let ujson: any = null;
        let utext: string | null = null;
        if (contentType.includes('application/json')) {
          try {
            ujson = await upload.json();
          } catch {
            utext = await upload.text().catch(() => null);
          }
        } else {
          utext = await upload.text().catch(() => null);
        }
        if (!upload.ok) {
          if (upload.status === 413) {
            throw new Error('File too large to upload. Please choose a smaller file.');
          }
          throw new Error(ujson?.error || utext || 'Upload failed');
        }
        payload.s3_key = ujson?.s3_key;
        payload.mime_type = ujson?.mime_type;
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
            <FileUpload
              label="Hero Image"
              accept="image/*"
              valueUrl={heroPreview}
              valueName={heroFileName || undefined}
              previewImage
              disabled={saving}
              onSelect={async (file) => {
                if (!file || !form.id) return;
                // Bug 2: Track current selection to avoid race in concurrent uploads
                const mySeq = ++uploadSeqRef.current;
                try {
                  const previewUrl = URL.createObjectURL(file);
                  setHeroPreview(previewUrl);
                  setHeroFileName(file.name);
                } catch {}
                setSaving(true);
                try {
                  const fd = new FormData();
                  fd.append('file', file);
                  const up = await fetch(`/api/admin/workshops/${form.id}/hero`, {
                    method: 'POST',
                    body: fd,
                  });
                  const upContentType = up.headers.get('content-type') || '';
                  let heroJson: any = null;
                  let heroText: string | null = null;
                  if (upContentType.includes('application/json')) {
                    try {
                      heroJson = await up.json();
                    } catch {
                      heroText = await up.text().catch(() => null);
                    }
                  } else {
                    heroText = await up.text().catch(() => null);
                  }
                  if (!up.ok) {
                    if (up.status === 413) {
                      throw new Error('File too large for upload. Please use a smaller image.');
                    }
                    throw new Error(heroJson?.error || heroText || 'Upload failed');
                  }
                  // Only update if this is the latest selected file
                  if (uploadSeqRef.current === mySeq) {
                    setHeroKey((heroJson && heroJson.s3_key) || undefined as any);
                  }
                } catch (err: any) {
                  alert(err.message || 'Failed to upload image');
                } finally {
                  // Bug 2: Only clear saving if this upload corresponds to latest selection
                  if (uploadSeqRef.current === mySeq) {
                    setSaving(false);
                  }
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-1">Upload replaces the current hero image.</p>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-800">Resource Passkey (optional)</label>
          <input
            name="resource_password"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            className="border border-gray-300 text-gray-900 rounded w-full px-3 py-2"
            placeholder={form.resource_password_hash ? '••••••• (leave empty to keep, clear to remove)' : 'e.g. CLARITY-2026'}
          />
          <p className="text-xs text-gray-500 mt-1">
            {form.resource_password_hash
              ? 'A passkey is currently set. To clear it, save with this field empty.'
              : 'Set a passkey to gate resources on the public page.'}
          </p>
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
                  <a
                    href={`/api/admin/workshops/${form.id}/resources/presign?resourceId=${r.id}`}
                    className="px-2 py-1 rounded-md border border-gray-300 text-gray-900 hover:bg-gray-50"
                  >
                    Download
                  </a>
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
              <div className="col-span-1 md:col-span-3">
                <FileUpload
                  label="Resource File"
                  accept="*/*"
                  valueName={resForm.file?.name || undefined}
                  onSelect={(file) => setResForm((p) => ({ ...p, file }))}
                />
              </div>
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

