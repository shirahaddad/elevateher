'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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
  let out = html
    .replace(/\{\{\s*firstName\s*\}\}/gi, firstName)
    .replace(/\{\{\s*publicID\s*\}\}/gi, subscriber.public_id)
    .replace(/\{\{\s*public_id\s*\}\}/gi, subscriber.public_id);
  // URL-encoded variants for preview
  out = out.replace(/%7B%7B\s*publicID\s*%7D%7D/gi, subscriber.public_id);
  out = out.replace(/%7B%7B\s*public_id\s*%7D%7D/gi, subscriber.public_id);
  // HTML entity-encoded variants
  out = out.replace(/&#123;\s*&#123;\s*publicID\s*&#125;\s*&#125;/gi, subscriber.public_id);
  out = out.replace(/&#123;\s*&#123;\s*public_id\s*&#125;\s*&#125;/gi, subscriber.public_id);
  return out;
}

export default function NewsletterTestPage() {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [subject, setSubject] = useState('');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Subscriber[]>([]);
  const [selected, setSelected] = useState<Subscriber | null>(null);
  const [sending, setSending] = useState(false);
  const [customSending, setCustomSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<Array<{ email: string; error: string }>>([]);
  const [customRecipients, setCustomRecipients] = useState('');
  const [lastCampaignId, setLastCampaignId] = useState<number | null>(null);

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
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-3 py-2 rounded text-sm"
                >
                  Choose ZIP…
                </button>
                <span className="text-xs text-gray-700 truncate">
                  {zipFile ? zipFile.name : 'No file selected'}
                </span>
              </div>
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
                setLastCampaignId(null);
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
                  if (!res.ok) {
                    // Handle partial results or errors
                    const campaignId = data.campaignId;
                    if (campaignId) {
                      setLastCampaignId(campaignId);
                      if (data.partial) {
                        setMessage(
                          `⚠️ Broadcast encountered an error but partially completed: sent ${data.sent}/${data.total}. ${data.failed} failed. ` +
                          `Campaign ID: ${campaignId}. Check status below or view campaign history.`
                        );
                      } else {
                        setMessage(
                          `❌ Broadcast failed: ${data.error || 'Unknown error'}. ` +
                          `Campaign ID: ${campaignId}. Check status below or view campaign history.`
                        );
                      }
                    } else {
                      setMessage(data.error || 'Broadcast failed');
                    }
                    setErrorDetails(Array.isArray(data.errors) ? data.errors : []);
                    return;
                  }
                  // Success case
                  if (data.campaignId) {
                    setLastCampaignId(data.campaignId);
                  }
                  setMessage(`✅ Broadcast complete: sent ${data.sent}/${data.total}. ${data.failed} failed.`);
                  setErrorDetails(Array.isArray(data.errors) ? data.errors : []);
                } catch (e: any) {
                  setMessage(`❌ Broadcast failed: ${e.message || 'Unknown error'}. Check campaign history for details.`);
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
            {message && (
              <div className="mt-2">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{message}</p>
                {lastCampaignId && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/admin/newsletter/campaigns/${lastCampaignId}`);
                          const data = await res.json();
                          if (res.ok && data.campaign) {
                            const c = data.campaign;
                            setMessage(
                              `📊 Campaign Status (ID: ${c.id}):\n` +
                              `Status: ${c.status === 'completed' ? '✅ Completed' : '⏳ In Progress'}\n` +
                              `Sent: ${c.success_count}/${c.total}\n` +
                              `Failed: ${c.error_count}\n` +
                              `Started: ${new Date(c.started_at).toLocaleString()}\n` +
                              (c.completed_at ? `Completed: ${new Date(c.completed_at).toLocaleString()}` : 'Still processing...')
                            );
                          } else {
                            setMessage(`Failed to load campaign status: ${data.error || 'Unknown error'}`);
                          }
                        } catch (e: any) {
                          setMessage(`Error checking status: ${e.message || 'Unknown error'}`);
                        }
                      }}
                      className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded"
                    >
                      Check Status
                    </button>
                    <a
                      href="/admin/newsletter/campaigns"
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded inline-block"
                    >
                      View All Campaigns
                    </a>
                  </div>
                )}
              </div>
            )}
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

          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-2">Custom Recipients (Non-subscribers)</h2>
            <p className="text-sm text-gray-700 mb-2">
              Send to specific email addresses not in your subscribers list. Separate multiple emails with commas.
            </p>
            <textarea
              value={customRecipients}
              onChange={(e) => setCustomRecipients(e.target.value)}
              placeholder="email1@example.com, email2@example.com"
              className="w-full border rounded px-3 py-2 text-sm"
              rows={3}
            />
            <button
              onClick={async () => {
                setMessage(null);
                setErrorDetails([]);
                if (!parseResult?.html || !subject || !customRecipients.trim()) {
                  setMessage('Enter subject, parse a ZIP, and add at least one recipient.');
                  return;
                }
                setCustomSending(true);
                try {
                  const res = await fetch('/api/admin/newsletter/send-ad-hoc', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      html: parseResult.html,
                      text: parseResult.text,
                      subject,
                      recipients: customRecipients,
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || 'Custom send failed');
                  setMessage(`Custom send complete: sent ${data.sent}/${data.total}. ${data.failed} failed.`);
                  setErrorDetails(Array.isArray(data.errors) ? data.errors : []);
                } catch (e: any) {
                  setMessage(e.message || 'Custom send failed');
                } finally {
                  setCustomSending(false);
                }
              }}
              disabled={customSending || !hasParsed || !hasSubject || !customRecipients.trim()}
              className="mt-3 bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {customSending ? 'Sending…' : 'Send to Custom Emails'}
            </button>
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


