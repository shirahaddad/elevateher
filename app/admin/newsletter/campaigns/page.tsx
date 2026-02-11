'use client';

import { useEffect, useState, useCallback } from 'react';
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
  archive?: {
    is_public: boolean;
    slug?: string | null;
    published_at?: string | null;
  } | null;
};

export default function CampaignsPage() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadCampaigns = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    setLoading(true);
    loadCampaigns();
  }, [loadCampaigns]);

  // Auto-refresh every 5 seconds if there are in-progress campaigns
  useEffect(() => {
    const hasInProgress = items.some(c => !c.completed_at);
    if (!hasInProgress) return;

    const interval = setInterval(() => {
      loadCampaigns();
    }, 5000);

    return () => clearInterval(interval);
  }, [items, loadCampaigns]);

  const publish = async (campaignId: number) => {
    setError(null);
    setBusyId(campaignId);
    try {
      const res = await fetch('/api/admin/newsletter/archive/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish');
      // refresh a single row in memory
      setItems((prev) =>
        prev.map((c) =>
          c.id === campaignId ? { ...c, archive: { ...(c.archive || {}), is_public: true, slug: data.slug, published_at: new Date().toISOString() } } : c
        )
      );
    } catch (e: any) {
      setError(e.message || 'Failed to publish');
    } finally {
      setBusyId(null);
    }
  };

  const unpublish = async (campaignId: number) => {
    setError(null);
    setBusyId(campaignId);
    try {
      const res = await fetch('/api/admin/newsletter/archive/unpublish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to unpublish');
      setItems((prev) =>
        prev.map((c) =>
          c.id === campaignId ? { ...c, archive: c.archive ? { ...c.archive, is_public: false } : { is_public: false, slug: null } } : c
        )
      );
    } catch (e: any) {
      setError(e.message || 'Failed to unpublish');
    } finally {
      setBusyId(null);
    }
  };

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
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Sent By</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Success</th>
                  <th className="px-4 py-2">Failed</th>
                  <th className="px-4 py-2">Archive</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => {
                  const status = c.completed_at ? 'completed' : 'in_progress';
                  const progress = c.total > 0 ? Math.round(((c.success_count + c.error_count) / c.total) * 100) : 0;
                  return (
                  <tr key={c.id} className="border-t">
                    <td className="px-4 py-2">{new Date(c.created_at || c.started_at).toLocaleString()}</td>
                    <td className="px-4 py-2">{c.subject}</td>
                    <td className="px-4 py-2">
                      {status === 'completed' ? (
                        <span className="text-green-700 font-medium">✅ Completed</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="text-blue-700 font-medium">⏳ In Progress</span>
                          <div className="w-24 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full transition-all" 
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{progress}% ({c.success_count + c.error_count}/{c.total})</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">{c.sent_by || '—'}</td>
                    <td className="px-4 py-2">{c.total}</td>
                    <td className="px-4 py-2 text-green-700">{c.success_count}</td>
                    <td className="px-4 py-2 text-red-700">{c.error_count}</td>
                    <td className="px-4 py-2">
                      {c.archive?.is_public ? (
                        <div className="flex items-center gap-2">
                          <span className="text-green-700">Published</span>
                          {c.archive?.slug ? (
                            <Link
                              href={`/newsletter/${c.archive.slug}`}
                              className="text-purple-700 underline"
                              target="_blank"
                            >
                              View
                            </Link>
                          ) : null}
                          <button
                            onClick={() => unpublish(c.id)}
                            className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                            disabled={busyId === c.id}
                          >
                            {busyId === c.id ? 'Working…' : 'Unpublish'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => publish(c.id)}
                          className="px-2 py-1 rounded bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-300"
                          disabled={busyId === c.id}
                        >
                          {busyId === c.id ? 'Working…' : 'Publish'}
                        </button>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


