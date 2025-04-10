'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestConnection() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test the connection by fetching the count of submissions
        const { count, error } = await supabase
          .from('questionnaire_submissions')
          .select('*', { count: 'exact', head: true });

        if (error) throw error;

        setStatus('success');
        console.log('Connection successful! Number of submissions:', count);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Connection error:', err);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-purple-900">Test Connection</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          {status === 'loading' && (
            <div className="text-center">
              <div className="text-gray-600">Testing connection to Supabase...</div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center text-green-600">
              <div className="text-xl font-semibold">✅ Connection Successful!</div>
              <div className="mt-2 text-sm">Check the browser console for details.</div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-center text-red-600">
              <div className="text-xl font-semibold">❌ Connection Failed</div>
              <div className="mt-2 text-sm">{error}</div>
              <div className="mt-4 text-xs text-gray-500">
                Please check your environment variables and database configuration.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 