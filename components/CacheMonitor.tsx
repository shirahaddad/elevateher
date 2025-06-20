'use client';

import { useState, useEffect } from 'react';

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  keys: string[];
  hitRate: number;
  hitRatePercentage: string;
}

export default function CacheMonitor() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/cache');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch cache statistics');
      }
    } catch (err) {
      setError('Failed to fetch cache statistics');
      console.error('Cache stats error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const clearCache = async () => {
    if (!confirm('Are you sure you want to clear all cache? This will temporarily impact performance.')) {
      return;
    }

    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/cache', { method: 'DELETE' });
      const result = await response.json();
      
      if (result.success) {
        await fetchStats();
      } else {
        setError(result.error || 'Failed to clear cache');
      }
    } catch (err) {
      setError('Failed to clear cache');
      console.error('Cache clear error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button
          onClick={fetchStats}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500">No cache statistics available</div>
      </div>
    );
  }

  const getHitRateColor = (hitRate: number) => {
    if (hitRate >= 80) return 'text-green-600';
    if (hitRate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHitRateBgColor = (hitRate: number) => {
    if (hitRate >= 80) return 'bg-green-100';
    if (hitRate >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Application Cache Monitor</h2>
        <div className="flex space-x-2">
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={clearCache}
            disabled={refreshing}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
          >
            Clear Cache
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Cache Hits</div>
          <div className="text-2xl font-bold text-green-600">{stats.hits.toLocaleString()}</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Cache Misses</div>
          <div className="text-2xl font-bold text-red-600">{stats.misses.toLocaleString()}</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Cache Size</div>
          <div className="text-2xl font-bold text-blue-600">{stats.size}</div>
        </div>
        
        <div className={`p-4 rounded-lg ${getHitRateBgColor(stats.hitRate)}`}>
          <div className="text-sm text-gray-600">Hit Rate</div>
          <div className={`text-2xl font-bold ${getHitRateColor(stats.hitRate)}`}>
            {stats.hitRatePercentage}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Cached Keys</h3>
        {stats.keys.length === 0 ? (
          <div className="text-gray-500 text-sm">No cached items</div>
        ) : (
          <div className="space-y-1">
            {stats.keys.slice(0, 10).map((key, index) => (
              <div key={index} className="text-sm font-mono text-gray-700 bg-white p-2 rounded border">
                {key}
              </div>
            ))}
            {stats.keys.length > 10 && (
              <div className="text-sm text-gray-500 mt-2">
                ... and {stats.keys.length - 10} more keys
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>• Blog posts are cached for 5 minutes</p>
        <p>• Individual blog posts are cached for 1 hour</p>
        <p>• Tags are cached for 24 hours</p>
        <p>• Cache is automatically invalidated when content is updated</p>
      </div>
    </div>
  );
} 