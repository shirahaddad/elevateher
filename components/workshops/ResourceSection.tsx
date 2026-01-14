'use client';

import { useEffect, useState } from 'react';

type Resource = {
  id: number;
  name: string;
  kind?: 'FILE' | 'URL' | 'TEXT';
  s3_key?: string;
  value?: string;
};

export default function ResourceSection({
  slug,
  resources,
  requiresPasskey,
  forceUnlocked = false,
}: {
  slug: string;
  resources: Resource[];
  requiresPasskey: boolean;
  forceUnlocked?: boolean;
}) {
  const [unlocked, setUnlocked] = useState<boolean>(forceUnlocked || !requiresPasskey);
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (forceUnlocked) setUnlocked(true);
  }, [forceUnlocked]);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/workshops/${slug}/resources/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Invalid passkey');
      setUnlocked(true);
    } catch (e: any) {
      setError(e.message || 'Invalid passkey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-2 text-purple-700">Resources</h2>

      {!unlocked ? (
        <form onSubmit={verify} className="flex items-center gap-2">
          <input
            type="text"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            placeholder="Enter passkey"
            className="border border-gray-300 rounded px-3 py-2 text-gray-900"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700"
          >
            {loading ? 'Checking...' : 'Submit'}
          </button>
          {error && <span className="text-sm text-red-600 ml-2">{error}</span>}
        </form>
      ) : (
        <ul className="space-y-3">
          {resources.map((r) => (
            <li key={r.id} className="flex items-center border rounded px-3 py-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 truncate">{r.name}</div>
              </div>
              {r.kind === 'URL' && r.value ? (
                <a
                  href={r.value}
                  className="ml-auto text-purple-700 hover:text-purple-900 underline max-w-[60%] overflow-hidden text-ellipsis whitespace-nowrap text-right"
                >
                  {r.value}
                </a>
              ) : r.kind === 'TEXT' ? (
                <span className="ml-auto text-sm text-gray-800 max-w-[60%] overflow-hidden text-ellipsis whitespace-nowrap text-right">
                  {r.value}
                </span>
              ) : r.kind === 'FILE' && r.s3_key ? (
                <a
                  href={`/api/workshops/${slug}/resources/presign?resourceId=${r.id}`}
                  className="ml-auto px-3 py-1 rounded-md border border-gray-300 text-gray-900 hover:bg-gray-50"
                >
                  Download
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

