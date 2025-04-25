'use client';

import Link from 'next/link';

export default function AdminPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-bold mb-8 text-purple-900 tracking-tight">Admin Page</h1>
          
                <div className="prose prose-lg max-w-none text-gray-600 space-y-6 mb-16">
                    <p>
                    Here you can view form submissions, manage blog posts and create new blog posts yourself.
                    </p>
                </div>
                <Link href={`/admin/dashboard`} className="block">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-200 hover:scale-[1.02] mb-8">
                        <div className="p-4">
                            <h2 className="text-xl font-bold text-purple-900 mb-1">Dashboard</h2>
                            <p className="text-gray-600 text-sm">Form submissions</p>
                        </div>
                    </div>
                </Link>
                <Link href={`/admin/blog`} className="block">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
                        <div className="p-4">
                            <h2 className="text-xl font-bold text-purple-900 mb-1">Blog</h2>
                            <p className="text-gray-600 text-sm">Posts updates and creations</p>
                        </div>
                    </div>
                </Link>

            </div>
        </div>

    );
  } 