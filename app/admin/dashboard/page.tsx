'use client';

/*
  Admin Dashboard
  ----------------
  Purpose:
  - Serves as the landing page for administrative tools in ElevateHer.
  - Provides quick links to core operational areas such as blog management,
    database connection pool monitoring, cache monitoring, submissions review,
    and analytics dashboards.

  Adding a new admin tool card:
  - Duplicate one of the existing <Link> blocks in the "Admin Navigation" grid.
  - Update:
    - href: to the route of the new tool (e.g., "/admin/new-tool")
    - gradient colors: Tailwind classes for visual differentiation
    - emoji/icon, title, and description
  - Keep the card's structure consistent to maintain a cohesive UI.

  Access considerations:
  - This page is intended for authenticated admin users. Ensure route-level or
    middleware-based protection is in place in the broader app (see `app/admin/layout.tsx`
    and auth middleware) to prevent unauthorized access.

  Styling:
  - Uses Tailwind CSS utility classes and gradient backgrounds for visual grouping.
  - Grid is responsive across breakpoints: single column → up to five columns.
*/

import Link from 'next/link';

/**
 * Admin Dashboard page listing primary admin tools.
 * No props. Renders a responsive grid of navigation cards.
 */
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
        
        {/* Admin Navigation
            - Each card is a self-contained link to a management/monitoring area.
            - Keep card copy concise (title + one-line description). */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/*blog*/}
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

          {/*community test vetting*/}
          <Link 
            href="/admin/community-test"
            className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="flex items-center mb-3">
              <div className="text-2xl mr-3">🧪</div>
              <h3 className="text-lg font-semibold">Community Vetting (Test)</h3>
            </div>
            <p className="text-pink-100 text-sm">
              Review and vet community-test signups
            </p>
          </Link>

          {/*analytics*/}
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
          
          {/*submissions*/}
          <Link 
            href="/admin/submissions"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="flex items-center mb-3">
              <div className="text-2xl mr-3">📋</div>
              <h3 className="text-lg font-semibold">Questionnaire Submissions</h3>
            </div>
            <p className="text-purple-100 text-sm">
              Review and manage client submissions
            </p>
          </Link>

          {/*settings*/}
          <Link 
            href="/admin/settings"
            className="bg-gradient-to-r from-slate-500 to-slate-600 text-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="flex items-center mb-3">
              <div className="text-2xl mr-3">⚙️</div>
              <h3 className="text-lg font-semibold">Settings</h3>
            </div>
            <p className="text-slate-100 text-sm">
              Manage Slack invite link
            </p>
          </Link>

          {/*submissions*/}
          <Link 
            href="/admin/waitlist"
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="flex items-center mb-3">
              <div className="text-2xl mr-3">📋</div>
              <h3 className="text-lg font-semibold">Waitlist</h3>
            </div>
            <p className="text-purple-100 text-sm">
              Review waitlist requests
            </p>
          </Link>

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
          

        </div>
      </div>
    </div>
  );
} 