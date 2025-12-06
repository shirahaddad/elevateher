'use client';

import { useEffect, useState } from 'react';

export default function UnsubscribePage() {
  const [status, setStatus] = useState<'loading'|'done'|'error'>('loading');
  const [email, setEmail] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || '';
    const t = params.get('token') || '';
    if (id) {
      setToken(''); // not used
      const runId = async () => {
        try {
          const res = await fetch(`/api/newsletter/unsubscribe?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to unsubscribe');
          setStatus('done');
          setMessage('You have been unsubscribed from our newsletter.');
        } catch (e: any) {
          setStatus('error');
          setMessage(e.message || 'Failed to unsubscribe. The link may be invalid or expired.');
        }
      };
      runId();
      return;
    }
    setToken(t);
    if (!t) {
      setStatus('error');
      setMessage('Missing unsubscribe information.');
      return;
    }
    const run = async () => {
      try {
        const res = await fetch(`/api/newsletter/unsubscribe?token=${encodeURIComponent(t)}`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to unsubscribe');
        setEmail(data.email || '');
        setStatus('done');
        setMessage('You have been unsubscribed from our newsletter.');
      } catch (e: any) {
        setStatus('error');
        setMessage(e.message || 'Failed to unsubscribe. The link may be invalid or expired.');
      }
    };
    run();
  }, []);

  const resubscribe = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id') || '';
      const body = id ? { id } : { token };
      const res = await fetch('/api/newsletter/resubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resubscribe');
      setMessage('You are subscribed again. Welcome back!');
      setStatus('done');
    } catch (e: any) {
      setStatus('error');
      setMessage(e.message || 'Failed to resubscribe.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-purple-900 mb-4">Newsletter Preferences</h1>
        {status === 'loading' && (
          <p className="text-gray-600">Processing your request...</p>
        )}
        {status !== 'loading' && (
          <div className="space-y-4">
            <p className={`${status === 'error' ? 'text-red-600' : 'text-gray-700'}`}>
              {message}
            </p>
            {status !== 'loading' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={resubscribe}
                  className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
                >
                  Resubscribe
                </button>
              </div>
            )}
            {email && (
              <p className="text-xs text-gray-500">Email: {email}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


