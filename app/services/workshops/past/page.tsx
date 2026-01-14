import Link from 'next/link';
import { workshopService } from '@/lib/api/services/workshops/workshop.service';

export default async function PastWorkshopsPage() {
  const result = await workshopService.listPastWorkshops({ page: 1, limit: 50 });
  const items = result.data;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-purple-900 mb-6">Past Workshops</h1>
        {items.length === 0 ? (
          <p className="text-gray-700">No past workshops yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((w) => (
              <Link
                key={w.id}
                href={`/services/workshops/${w.slug}`}
                className="block border rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="text-lg font-semibold text-gray-900 mb-1">{w.title}</div>
                <div className="text-sm text-gray-700">{new Date(w.start_at || '').toLocaleDateString('en-US')}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

