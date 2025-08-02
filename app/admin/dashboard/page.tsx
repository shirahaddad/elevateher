'use client';

import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-900">Admin Dashboard</h1>
          <p className="text-lg text-gray-600 mt-2">
            Welcome to the ElevateHer admin panel. Manage your application from here.
          </p>
        </div>
        
        {/* Admin Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <Link 
            href="/admin/connection-pool"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="flex items-center mb-3">
              <div className="text-2xl mr-3">🔗</div>
              <h3 className="text-lg font-semibold">Connection Pool</h3>
            </div>
            <p className="text-blue-100 text-sm">
              Monitor database performance and connection health
            </p>
          </Link>
          
          <Link 
            href="/admin/cache"
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="flex items-center mb-3">
              <div className="text-2xl mr-3">⚡</div>
              <h3 className="text-lg font-semibold">Cache Monitor</h3>
            </div>
            <p className="text-orange-100 text-sm">
              Monitor and manage application caching
            </p>
          </Link>
          
          <Link 
            href="/admin/blog"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="flex items-center mb-3">
              <div className="text-2xl mr-3">📝</div>
              <h3 className="text-lg font-semibold">Blog Management</h3>
            </div>
            <p className="text-green-100 text-sm">
              Create, edit, and manage blog posts
            </p>
          </Link>
          
          <Link 
            href="/admin/submissions"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="flex items-center mb-3">
              <div className="text-2xl mr-3">📋</div>
              <h3 className="text-lg font-semibold">Submissions</h3>
            </div>
            <p className="text-purple-100 text-sm">
              Review and manage client submissions
            </p>
          </Link>
          
          <Link 
            href="/admin/analytics"
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="flex items-center mb-3">
              <div className="text-2xl mr-3">📊</div>
              <h3 className="text-lg font-semibold">Analytics</h3>
            </div>
            <p className="text-indigo-100 text-sm">
              View website analytics and user insights
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
} 