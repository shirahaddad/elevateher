import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import AutoHeightIframe from '@/components/AutoHeightIframe';
import Link from 'next/link';

async function loadEntry(slug: string) {
  const h = headers() as any;
  const proto = h.get('x-forwarded-proto') || 'http';
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/newsletter/archive/${encodeURIComponent(slug)}`, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  const data = await res.json();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await loadEntry(slug);
  if (!entry) return { title: 'Newsletter' };
  const title = entry.subject || 'Newsletter';
  return {
    title,
    description: `Read "${title}" in the Elevate(Her) newsletter archive. Past issues on women in tech, leadership, and career development.`,
    openGraph: {
      title,
      description: `Read "${title}" in the Elevate(Her) newsletter archive.`,
      url: `/newsletter/${entry.slug}`,
      type: 'article',
    },
  };
}

export default async function NewsletterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await loadEntry(slug);
  if (!entry) notFound();
  return (
    <div className="min-h-screen py-16 bg-white text-slate-900">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-2">
          <Link href="/newsletter" className="text-purple-700 hover:underline text-sm">
            ← Back to archive
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-purple-900 mb-4">{entry.subject}</h1>
        <div className="text-xs text-gray-700 mb-4">
          {entry.published_at ? new Date(entry.published_at).toLocaleDateString() : ''}
        </div>
        <div className="border rounded-lg overflow-hidden">
          <AutoHeightIframe
            title={entry.subject}
            className="w-full bg-white"
            srcDoc={entry.html || ''}
            minHeight={500}
          />
        </div>
        <div className="mt-6">
          <a
            href="/learn-more"
            className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Subscribe for future issues
          </a>
        </div>
      </div>
    </div>
  );
}

