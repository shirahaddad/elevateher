'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/settings/slack-invite', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch setting');
        setInviteLink(data.value || '');
        setError(null);
      } catch (e: any) {
        setError(e.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings/slack-invite', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: inviteLink }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save setting');
      setMessage('Saved successfully.');
    } catch (e: any) {
      setError(e.message || 'Failed to save setting');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-purple-900">Admin Settings</h1>
            <p className="text-lg text-gray-600 mt-2">Manage Slack invite link.</p>
          </div>
          <Link
            href="/admin/dashboard"
            className="text-sm text-purple-700 hover:text-purple-900"
          >
            Back to Dashboard
          </Link>
        </div>

        <form onSubmit={onSave} className="bg-white rounded-lg shadow p-6 border border-gray-100 max-w-3xl">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slack Invite Link
          </label>
          <input
            type="text"
            value={inviteLink}
            onChange={(e) => setInviteLink(e.target.value)}
            placeholder="https://join.slack.com/..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"
          />
          <p className="text-xs text-gray-500 mt-2">
            This link will be used in approval emails. You can rotate it here anytime.
          </p>

          {error && <div className="text-red-600 text-sm mt-3">{error}</div>}
          {message && <div className="text-green-700 text-sm mt-3">{message}</div>}

          <div className="mt-6">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>

        {/* Newsletter Export */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100 max-w-3xl mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Newsletter Subscribers</h2>
          <p className="text-sm text-gray-600 mb-2">
            Use this CSV to import into your email platform. Unsubscribe link template:
          </p>
          <pre className="text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded p-2 overflow-x-auto">
            {`${(process.env.NEXT_PUBLIC_BASE_URL || 'https://elevateher.tech')}/unsubscribe?id={{public_id}}`}
          </pre>
          <div className="mt-4">
            <a
              href="/api/admin/newsletter/export"
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              Download CSV (email, name, public_id, status)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


