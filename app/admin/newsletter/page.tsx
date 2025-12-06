'use client';

import { useEffect, useMemo, useState } from 'react';

type ParseResult = {
  html: string;
  text?: string;
  assets: Record<string, string>;
};

type Subscriber = {
  email: string;
  name?: string | null;
  public_id: string;
  status: string;
};

function substitutePreview(html: string, subscriber: Subscriber | null): string {
  if (!subscriber) return html;
  const firstName = (subscriber.name?.trim()?.split(/\s+/)[0]) || subscriber.email.split('@')[0];
  return html
    .replace(/\{\{\s*firstName\s*\}\}/g, firstName)
    .replace(/\{\{\s*publicID\s*\}\}/g, subscriber.public_id);
}

export default function NewsletterTestPage() {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [subject, setSubject] = useState('');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Subscriber[]>([]);
  const [selected, setSelected] = useState<Subscriber | null>(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<Array<{ email: string; error: string }>>([]);

  const previewHtml = useMemo(() => {
    if (!parseResult?.html) return '';
    return substitutePreview(parseResult.html, selected);
  }, [parseResult, selected]);

  const hasParsed = !!parseResult?.html && parseResult.html.trim().length > 0;
  const hasSubject = subject.trim().length > 0;
  const hasRecipient = !!selected?.public_id;
  const canSend = !sending && hasParsed && hasSubject && hasRecipient;
  const canBroadcast = !sending && hasParsed && hasSubject;

  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/admin/newsletter/recipients?status=subscribed', { cache: 'no-store' });
        const data = await res.json();
        if (res.ok) setRecipientCount(data.count ?? 0);
      } catch {}
    };
    fetchCount();
  }, []);

  const onUpload = async () => {
    setMessage(null);
    if (!zipFile) {
      setMessage('Please choose a Canva ZIP file.');
      return;
    }
    const fd = new FormData();
    fd.append('file', zipFile);
    const res = await fetch('/api/admin/newsletter/parse', {
      method: 'POST',
      body: fd,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || 'Failed to parse ZIP');
      return;
    }
    const data = (await res.json()) as ParseResult;
    setParseResult(data);
    setMessage('ZIP parsed. Preview ready.');
  };

  const onSearch = async () => {
    setMessage(null);
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/newsletter/subscribers?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      setResults(data.results || []);
    } catch (e: any) {
      setMessage(e.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const onSend = async () => {
    setMessage(null);
    if (!parseResult?.html || !subject || !selected) {
      setMessage('Missing subject, preview, or recipient.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/admin/newsletter/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: parseResult.html,
          text: parseResult.text,
          subject,
          subscriberId: selected.public_id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setMessage('Test email sent.');
    } catch (e: any) {
      setMessage(e.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen py-16 bg-white text-slate-900">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-900">Admin Newsletter</h1>
          <p className="text-gray-800 mt-1">Upload Canva ZIP, preview, and send a single test or broadcast to all subscribers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-2">1) Upload Canva ZIP</h2>
              <input
                type="file"
                accept=".zip"
                onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                className="block w-full text-sm"
              />
              <button
                onClick={onUpload}
                className="mt-3 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Parse ZIP
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-2">2) Subject</h2>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-2">3) Select Recipient</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by email…"
                  className="flex-1 border rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={onSearch}
                  className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-700"
                  disabled={searching}
                >
                  {searching ? 'Searching…' : 'Search'}
                </button>
              </div>
              <div className="mt-3 max-h-48 overflow-auto">
                {results.map((r) => (
                  <div
                    key={r.public_id}
                    onClick={() => setSelected(r)}
                    className={`text-sm p-2 rounded cursor-pointer ${selected?.public_id === r.public_id ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'}`}
                  >
                    <div className="font-medium">{r.email}</div>
                    <div className="text-gray-700">{r.name || '—'} · {r.status} · {r.public_id}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <button
                onClick={onSend}
                disabled={!canSend}
                className="bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {sending ? 'Sending…' : 'Send Test'}
              </button>
              {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
              {!canSend && (
                <div className="mt-2 text-xs">
                  <div className="font-medium text-slate-900">Why disabled?</div>
                  <ul className="mt-1 space-y-1">
                    <li className={hasParsed ? 'text-green-700' : 'text-red-700'}>
                      {hasParsed ? '✔︎ ZIP parsed' : '• Parse a Canva ZIP first'}
                    </li>
                    <li className={hasSubject ? 'text-green-700' : 'text-red-700'}>
                      {hasSubject ? '✔︎ Subject set' : '• Enter a Subject'}
                    </li>
                    <li className={hasRecipient ? 'text-green-700' : 'text-red-700'}>
                      {hasRecipient ? '✔︎ Recipient selected' : '• Select a recipient'}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 border rounded-lg">
            <div className="border-b px-4 py-3">
              <h2 className="font-semibold">Preview</h2>
              <p className="text-xs text-gray-700">Tokens supported: {'{{firstName}}'}, {'{{publicID}}'}</p>
            </div>
            <div className="p-0">
              {previewHtml ? (
                <iframe
                  title="Preview"
                  className="w-full h-[70vh] bg-white"
                  srcDoc={previewHtml}
                />
              ) : (
                <div className="p-4 text-sm text-gray-700">Upload and parse a ZIP to preview.</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-2">Broadcast Mode</h2>
            <p className="text-sm text-gray-700">
              Recipients: {recipientCount === null ? 'Loading…' : `${recipientCount} subscribed`}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              <a href="/admin/newsletter/campaigns" className="text-purple-700 hover:underline">View campaign history</a>
            </p>
            <button
              onClick={async () => {
                setMessage(null);
                setErrorDetails([]);
                if (!canBroadcast || !parseResult?.html) return;
                if (!window.confirm(`Send to ${recipientCount ?? 'all'} subscribed recipients?`)) return;
                setSending(true);
                try {
                  const res = await fetch('/api/admin/newsletter/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      html: parseResult.html,
                      text: parseResult.text,
                      subject,
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || 'Broadcast failed');
                  setMessage(`Broadcast complete: sent ${data.sent}/${data.total}. ${data.failed} failed.`);
                  setErrorDetails(Array.isArray(data.errors) ? data.errors : []);
                } catch (e: any) {
                  setMessage(e.message || 'Broadcast failed');
                } finally {
                  setSending(false);
                }
              }}
              disabled={!canBroadcast}
              className="mt-3 bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              {sending ? 'Sending…' : 'Send Broadcast'}
            </button>
            {!canBroadcast && (
              <div className="mt-2 text-xs">
                <div className="font-medium text-slate-900">Why disabled?</div>
                <ul className="mt-1 space-y-1">
                  <li className={hasParsed ? 'text-green-700' : 'text-red-700'}>
                    {hasParsed ? '✔︎ ZIP parsed' : '• Parse a Canva ZIP first'}
                  </li>
                  <li className={hasSubject ? 'text-green-700' : 'text-red-700'}>
                    {hasSubject ? '✔︎ Subject set' : '• Enter a Subject'}
                  </li>
                </ul>
              </div>
            )}
            {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
            {errorDetails.length > 0 && (
              <div className="mt-3">
                <details className="text-sm">
                  <summary className="cursor-pointer text-red-700">View failed recipients ({errorDetails.length})</summary>
                  <ul className="mt-2 list-disc pl-5">
                    {errorDetails.map((e, idx) => (
                      <li key={idx} className="text-gray-800">
                        <span className="font-medium">{e.email}:</span> {e.error}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4 lg:col-span-2">
            <h2 className="font-semibold mb-2">Subscribers & Export</h2>
            <p className="text-sm text-gray-700 mb-2">
              Use this CSV for backups or external tools. Unsubscribe link template for emails:
            </p>
            <pre className="text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded p-2 overflow-x-auto">
{`${(process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://elevateher.tech')}/api/newsletter/unsubscribe?id={{publicID}}`}
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
    </div>
  );
}


