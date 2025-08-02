'use client';

import { useState, useEffect } from 'react';
import { AnalyticsData, getAnalyticsData } from '@/lib/analytics';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]); // fetchAnalyticsData is stable, no need to include

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const analyticsData = await getAnalyticsData(timeRange);
      setData(analyticsData);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <div className="mt-4">
                  <button
                    onClick={fetchAnalyticsData}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded text-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <div className="flex space-x-2">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/analytics/track', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        event_type: 'test_event',
                        page_url: window.location.href,
                        page_title: 'Manual Test',
                        session_id: 'manual_test_' + Date.now()
                      })
                    });
                    const result = await response.json();
                    alert(`Test result: ${response.status} - ${JSON.stringify(result)}`);
                    // Refresh data after test
                    fetchAnalyticsData();
                  } catch (error) {
                    alert(`Error: ${error}`);
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                🧪 Test
              </button>
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setTimeRange(days)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    timeRange === days
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {days} days
                </button>
              ))}
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            Analytics data for the last {timeRange} days
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl mb-2">👁️</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Page Views</p>
                <p className="text-2xl font-semibold text-gray-900">{data?.totalPageViews || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Unique Visitors</p>
                <p className="text-2xl font-semibold text-gray-900">{data?.uniqueVisitors || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl mb-2">📝</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Form Submissions</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {data?.formSubmissions?.reduce((sum, form) => sum + (form.count || 0), 0) || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Avg. Pages/Session</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {data?.uniqueVisitors && data?.totalPageViews 
                    ? (data.totalPageViews / data.uniqueVisitors).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Pages */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Top Pages</h2>
            </div>
            <div className="p-6">
              {data?.topPages && data.topPages.length > 0 ? (
                <div className="space-y-4">
                  {data.topPages.slice(0, 10).map((page, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {page.page || 'Unknown Page'}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {page.views} views
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No page data available</p>
              )}
            </div>
          </div>

          {/* Form Submissions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Form Submissions</h2>
            </div>
            <div className="p-6">
              {data?.formSubmissions && data.formSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {data.formSubmissions.map((form, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {form.form.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {form.count} submissions
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No form submission data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {data.recentActivity.slice(0, 15).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium capitalize">
                          {activity.event_type.replace('_', ' ')}
                        </span>
                        {activity.page_url && (
                          <span className="text-gray-500 ml-2">
                            on {activity.page_url}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}