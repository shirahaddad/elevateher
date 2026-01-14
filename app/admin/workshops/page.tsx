'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Workshop = {
  id: number;
  title: string;
  slug: string;
  status: 'NEXT' | 'FUTURE' | 'PAST';
  start_at?: string;
  created_at: string;
};

type ListResponse = {
  data: Workshop[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function AdminWorkshopsPage() {
  const [items, setItems] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEXT' | 'FUTURE' | 'PAST'>('ALL');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      const res = await fetch(`/api/admin/workshops?${params.toString()}`, { cache: 'no-store' });
      const json: ListResponse | { error: string } = await res.json();
      if (!res.ok || (json as any).error) throw new Error((json as any).error || 'Failed to load');
      setItems((json as ListResponse).data);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const onDelete = async (id: string) => {
    if (!confirm('Delete this workshop? This cannot be undone.')) return;
    const res = await fetch(`/api/admin/workshops/${id}`, { method: 'DELETE' });
    if (res.ok) load();
  };

  const onSetNext = async (id: string) => {
    if (!confirm('Set this as NEXT? Previous NEXT will become PAST.')) return;
    const res = await fetch(`/api/admin/workshops/${id}/set-next`, { method: 'POST' });
    if (res.ok) load();
  };

  return (
    <div className="min-h-screen py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-purple-900">Workshops</h1>
          <Link href="/admin/workshops/new" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
            New Workshop
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm text-gray-800">Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-gray-300 rounded px-2 py-1 text-gray-900"
          >
            <option value="ALL">All</option>
            <option value="NEXT">NEXT</option>
            <option value="FUTURE">FUTURE</option>
            <option value="PAST">PAST</option>
          </select>
        </div>

        {loading ? (
          <div className="text-gray-900">Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Slug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Start</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((w) => (
                    <tr key={w.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          <Link href={`/admin/workshops/edit/${w.id}`} className="text-purple-700 hover:text-purple-900 underline">
                            {w.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{w.slug}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{w.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{w.start_at ? new Date(w.start_at).toLocaleString() : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/workshops/edit/${w.id}`}
                            title="Edit"
                            className="inline-flex items-center justify-center w-9 h-8 rounded-md border border-gray-300 text-gray-900 hover:bg-gray-50"
                          >
                            E
                          </Link>
                          <button
                            title="Delete"
                            onClick={() => onDelete(w.id)}
                            className="inline-flex items-center justify-center w-9 h-8 rounded-md border border-gray-300 text-red-700 hover:bg-red-50"
                          >
                            D
                          </button>
                          {w.status !== 'NEXT' && (
                            <button
                              title="Set NEXT"
                              onClick={() => onSetNext(w.id)}
                              className="inline-flex items-center justify-center w-12 h-8 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                            >
                              SN
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

