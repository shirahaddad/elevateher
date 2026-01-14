import Link from 'next/link';
import { workshopService } from '@/lib/api/services/workshops/workshop.service';
import MarkdownPreview from '@/components/blog/MarkdownPreview';
import ResourceSection from '@/components/workshops/ResourceSection';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

function formatEst(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(d);
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
  return `${date} at ${time} (EST)`;
}

export default async function WorkshopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const workshop = await workshopService.getWorkshopBySlug(slug);
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean(session);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-8 py-16">
        <Link
          href="/services/workshops"
          className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 transition-colors mb-8 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Workshops
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M12 3l2.6 5.2L20 10.8l-5.4 2.6L12 19l-2.6-5.6L4 10.8l5.4-2.6L12 3z" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-purple-900 mb-2">{workshop.title}</h1>
            {workshop.start_at && (
              <p className="text-gray-600">
                {formatEst(workshop.start_at)?.replace('(EST)', 'ET')}
              </p>
            )}
          </div>

          <div className="space-y-6 text-gray-700">
            {workshop.summary && <p>{workshop.summary}</p>}
            {workshop.content_md && (
              <div className="mt-2">
                <MarkdownPreview content={workshop.content_md} />
              </div>
            )}
          </div>

          {workshop.registration_url && (
            <div className="mt-8">
              <a
                href={workshop.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl hover:bg-purple-700"
              >
                Register on Zoom
              </a>
              <p className="text-xs text-gray-500 text-center mt-2">
                You’ll be taken to Zoom to complete your registration.
              </p>
            </div>
          )}

          {workshop.resources && workshop.resources.length > 0 && (
            <ResourceSection
              slug={slug}
              resources={workshop.resources}
              requiresPasskey={!!workshop.resource_password_hash}
              forceUnlocked={isAdmin}
            />
          )}
        </div>
      </div>
    </div>
  );
}

