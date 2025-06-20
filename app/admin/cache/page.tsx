import CacheMonitor from '@/components/CacheMonitor';

export default function CachePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cache Management</h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage application-level caching for improved performance.
        </p>
      </div>
      
      <CacheMonitor />
    </div>
  );
} 