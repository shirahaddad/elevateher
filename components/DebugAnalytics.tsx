'use client';

import { useState } from 'react';

export default function DebugAnalytics() {
  const [result, setResult] = useState('');

  const testTracking = async () => {
    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'page_view',
          page_url: window.location.href,
          page_title: document.title,
          session_id: 'debug_test_' + Date.now(),
          user_agent: navigator.userAgent,
          referrer: document.referrer
        })
      });
      
      const data = await response.json();
      setResult(`Success: ${response.status} - ${JSON.stringify(data)}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  const checkGtag = () => {
    setResult(`gtag available: ${typeof window.gtag}, GA ID: ${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 border rounded shadow-lg max-w-md">
      <h3 className="font-bold mb-2">Debug Analytics</h3>
      <div className="space-y-2">
        <button 
          onClick={testTracking}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Test API Tracking
        </button>
        <button 
          onClick={checkGtag}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm ml-2"
        >
          Check gtag
        </button>
      </div>
      {result && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          {result}
        </div>
      )}
    </div>
  );
}