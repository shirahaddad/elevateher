'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { WaitlistEntry } from '@/types/waitlist';

type VettingEntry = WaitlistEntry & {
  status?: 'pending' | 'approved' | 'rejected' | 'delayed' | null;
  reviewed_by_name?: string | null;
  reviewed_by_email?: string | null;
  reviewed_at?: string | null;
  decision_reason?: string | null;
};

export default function CommunityTestVettingPage() {
  const { data: session, status } = useSession();
  const [entries, setEntries] = useState<VettingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, [currentPage]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/admin/community-join?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch community-test entries');
      }
      const data = await response.json();
      setEntries(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      console.error('Error fetching community-test entries:', err);
      setError('Failed to load community-test entries');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
    }
  };

  // Highlight a specific row if id is present in query string (client-only)
  useEffect(() => {
    if (entries.length === 0) return;
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;
    setHighlightId(id);
    setTimeout(() => setHighlightId(null), 4000);
    setTimeout(() => {
      const el = document.getElementById(`row-${id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, [entries]);
  if (loading) {
    return (
      <div className="min-h-screen py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-red-600">You must be signed in to vet entries.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-900">Community Test Vetting</h1>
          <p className="text-lg text-gray-600 mt-2">
            Review and vet signups for the Slack community test flow
          </p>
        </div>
        <div className="mb-4 text-sm text-gray-600">
          Acting as: <span className="font-medium text-gray-900">{session?.user?.name}</span> ({session?.user?.email})
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LinkedIn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    id={`row-${entry.id}`}
                    className={`hover:bg-gray-50 ${highlightId === entry.id ? 'bg-yellow-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            const res = await fetch('/api/admin/community-join', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                id: entry.id,
                                action: 'approve',
                              }),
                            });
                            if (res.ok) fetchEntries();
                          }}
                          className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                          title="Approve"
                          aria-label="Approve"
                        >
                          A
                        </button>
                        <button
                          onClick={async () => {
                            const reason = window.prompt('Please provide a reason for rejection:');
                            if (!reason) return;
                            const res = await fetch('/api/admin/community-join', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                id: entry.id,
                                action: 'reject',
                                reason,
                              }),
                            });
                            if (res.ok) fetchEntries();
                          }}
                          className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                          title="Reject"
                          aria-label="Reject"
                        >
                          R
                        </button>
                        <button
                          onClick={async () => {
                            const res = await fetch('/api/admin/community-join', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                id: entry.id,
                                action: 'delay',
                              }),
                            });
                            if (res.ok) fetchEntries();
                          }}
                          className="px-3 py-1 rounded bg-yellow-600 text-white hover:bg-yellow-700"
                          title="Delay"
                          aria-label="Delay"
                        >
                          D
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <a 
                        href={`mailto:${entry.email}`}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        {entry.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.linkedin ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={entry.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-800 truncate max-w-[220px]"
                            title={entry.linkedin}
                          >
                            {entry.linkedin}
                          </a>
                          <button
                            onClick={() => copyToClipboard(entry.linkedin as string, entry.id)}
                            className="text-gray-500 hover:text-gray-700"
                            aria-label="Copy LinkedIn URL"
                            title={copiedId === entry.id ? 'Copied!' : 'Copy'}
                          >
                            {copiedId === entry.id ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {entry.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {entries.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No community-test entries</h3>
              <p className="mt-1 text-sm text-gray-500">
                No entries found for category "community-test".
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


