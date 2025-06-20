'use client';

import { useState, useEffect } from 'react';

interface ConnectionMetrics {
  totalRequests: number;
  activeConnections: number;
  connectionErrors: number;
  averageResponseTime: number;
  lastRequestTime: number;
}

interface PoolStatus {
  config: {
    maxConnections: number;
    minConnections: number;
    connectionTimeout: number;
    idleTimeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  metrics: ConnectionMetrics;
  health: {
    isHealthy: boolean;
    lastCheck: string;
  };
}

interface PerformanceData {
  metrics: ConnectionMetrics;
  poolStatus: PoolStatus;
  timestamp: string;
}

export default function ConnectionPoolMonitor() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/connection-pool');
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch metrics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Connection Pool Monitor</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Connection Pool Monitor</h2>
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Connection Pool Monitor</h2>
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  const { metrics, poolStatus } = data;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Connection Pool Monitor</h2>
      
      {/* Health Status */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">Health Status:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            poolStatus.health.isHealthy 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {poolStatus.health.isHealthy ? 'Healthy' : 'Unhealthy'}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          Last check: {new Date(poolStatus.health.lastCheck).toLocaleString()}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{metrics.totalRequests}</div>
          <div className="text-sm text-blue-800">Total Requests</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{metrics.activeConnections}</div>
          <div className="text-sm text-green-800">Active Connections</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{metrics.connectionErrors}</div>
          <div className="text-sm text-red-800">Connection Errors</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {metrics.averageResponseTime.toFixed(0)}ms
          </div>
          <div className="text-sm text-purple-800">Avg Response Time</div>
        </div>
      </div>

      {/* Pool Configuration */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3 text-gray-900">Pool Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Max Connections:</span>
            <span className="ml-2 text-gray-700">{poolStatus.config.maxConnections}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Min Connections:</span>
            <span className="ml-2 text-gray-700">{poolStatus.config.minConnections}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Connection Timeout:</span>
            <span className="ml-2 text-gray-700">{poolStatus.config.connectionTimeout}ms</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Idle Timeout:</span>
            <span className="ml-2 text-gray-700">{poolStatus.config.idleTimeout}ms</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Retry Attempts:</span>
            <span className="ml-2 text-gray-700">{poolStatus.config.retryAttempts}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Retry Delay:</span>
            <span className="ml-2 text-gray-700">{poolStatus.config.retryDelay}ms</span>
          </div>
        </div>
      </div>

      {/* Connection Usage */}
      <div>
        <h3 className="text-lg font-medium mb-3 text-gray-900">Connection Usage</h3>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min((metrics.activeConnections / poolStatus.config.maxConnections) * 100, 100)}%` 
            }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-700 mt-1">
          <span>{metrics.activeConnections} active</span>
          <span>{poolStatus.config.maxConnections} max</span>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-xs text-gray-700 text-center">
        Last updated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
} 