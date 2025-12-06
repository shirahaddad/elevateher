'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Campaign = {
  id: number;
  subject: string;
  campaign_key?: string | null;
  total: number;
  success_count: number;
  error_count: number;
  sent_by?: string | null;
  started_at: string;
  completed_at?: string | null;
  created_at: string;
};

export default function CampaignsPage() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/newsletter/campaigns?limit=100', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load campaigns');
        setItems(data.campaigns || []);
      } catch (e: any) {
        setError(e.message || 'Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen py-16 bg-white text-slate-900">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">Newsletter Campaigns</h1>
            <p className="text-gray-800 mt-1">Recent broadcast history</p>
          </div>
          <Link href="/admin/newsletter" className="text-purple-700 hover:underline text-sm">← Back to Newsletter</Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-700">Loading…</p>
        ) : error ? (
          <p className="text-sm text-red-700">{error}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-700">No campaigns yet.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="px-4 py-2">Created</th>
                  <th className="px-4 py-2">Subject</th>
                  <th className="px-4 py-2">Sent By</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Success</th>
                  <th className="px-4 py-2">Failed</th>
                  <th className="px-4 py-2">Key</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-4 py-2">{new Date(c.created_at || c.started_at).toLocaleString()}</td>
                    <td className="px-4 py-2">{c.subject}</td>
                    <td className="px-4 py-2">{c.sent_by || '—'}</td>
                    <td className="px-4 py-2">{c.total}</td>
                    <td className="px-4 py-2 text-green-700">{c.success_count}</td>
                    <td className="px-4 py-2 text-red-700">{c.error_count}</td>
                    <td className="px-4 py-2">{c.campaign_key || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


