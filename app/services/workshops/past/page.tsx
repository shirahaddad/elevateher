import Link from 'next/link';
import Image from 'next/image';
import { workshopService } from '@/lib/api/services/workshops/workshop.service';

export const revalidate = 60;

export default async function PastWorkshopsPage() {
  const result: any = await workshopService.listPastWorkshops({ page: 1, limit: 50 });
  const items = result.data as any[];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Link
          href="/services/workshops"
          className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 transition-colors mb-6 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Workshops
        </Link>
        <h1 className="text-3xl font-bold text-purple-900 mb-6">Past Workshops</h1>
        {items.length === 0 ? (
          <p className="text-gray-700">No past workshops yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((w: any) => (
              <Link
                key={w.id}
                href={`/services/workshops/${w.slug}?from=past`}
                className="block border rounded-lg hover:shadow-md transition overflow-hidden"
              >
                {w.hero_image_key ? (
                  <div className="relative w-full h-40 bg-gray-50">
                    <Image
                      src={w.hero_image_key}
                      alt={w.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : null}
                <div className="p-4">
                  <div className="text-lg font-semibold text-purple-900 mb-1">{w.title}</div>
                  <div className="text-sm text-gray-700">
                    {w.start_at ? new Date(w.start_at).toLocaleDateString('en-US') : ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

