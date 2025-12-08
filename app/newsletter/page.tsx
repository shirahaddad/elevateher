import Link from 'next/link';
import { headers } from 'next/headers';

async function loadArchive() {
  const h = headers();
  const proto = h.get('x-forwarded-proto') || 'http';
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/newsletter/archive?limit=50`, { cache: 'no-store' });
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];
}

export default async function NewsletterArchivePage() {
  const items = await loadArchive();
  return (
    <div className="min-h-screen py-16 bg-white text-slate-900">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-purple-900 mb-2">Newsletter Archive</h1>
        <p className="text-gray-800 mb-6">Browse selected past newsletters.</p>
        {items.length === 0 ? (
          <p className="text-sm text-gray-700">No published newsletters yet.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((it: any) => (
              <li key={it.slug} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Link href={`/newsletter/${it.slug}`} className="text-purple-700 hover:underline font-semibold">
                      {it.subject}
                    </Link>
                    <div className="text-xs text-gray-700">
                      {it.published_at ? new Date(it.published_at).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <Link
                    href={`/newsletter/${it.slug}`}
                    className="px-3 py-1 rounded bg-purple-600 text-white text-sm hover:bg-purple-700"
                  >
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

