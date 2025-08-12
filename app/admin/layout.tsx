'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SessionProvider } from "next-auth/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end items-center h-16">
              <div className="flex items-center space-x-4">
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/admin' || pathname === '/admin/dashboard'
                      ? 'bg-purple-100 text-purple-900'
                      : 'text-gray-600 hover:text-purple-900 hover:bg-purple-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/blog"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/admin/blog'
                      ? 'bg-purple-100 text-purple-900'
                      : 'text-gray-600 hover:text-purple-900 hover:bg-purple-50'
                  }`}
                >
                  Blog
                </Link>
                <Link
                  href="/admin/analytics"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/admin/submissions'
                      ? 'bg-purple-100 text-purple-900'
                      : 'text-gray-600 hover:text-purple-900 hover:bg-purple-50'
                  }`}
                >
                  Analytics
                </Link>
              </div>
            </div>
          </div>
        </nav>
        
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
} 