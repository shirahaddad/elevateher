'use client';

import ConnectionPoolMonitor from '@/components/ConnectionPoolMonitor';

export default function ConnectionPoolPage() {
  return (
    <div className="min-h-screen py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-900">Connection Pool Monitor</h1>
          <p className="text-lg text-gray-600 mt-2">
            Real-time monitoring of database connection pool performance and health
          </p>
        </div>
        
        <ConnectionPoolMonitor />
        
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">About Connection Pooling</h2>
          <p className="text-gray-600 mb-4">
            Connection pooling improves database performance by maintaining a pool of reusable database connections. 
            This reduces the overhead of creating new connections for each request and improves response times.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Key Metrics:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li><strong>Total Requests:</strong> Number of database operations processed</li>
                <li><strong>Active Connections:</strong> Currently active database connections</li>
                <li><strong>Connection Errors:</strong> Failed connection attempts</li>
                <li><strong>Average Response Time:</strong> Mean time for database operations</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Performance Benefits:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Reduced connection overhead (100-200ms saved per request)</li>
                <li>Better handling of concurrent users</li>
                <li>Improved scalability under load</li>
                <li>Automatic connection cleanup and resource management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 