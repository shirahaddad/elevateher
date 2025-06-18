/**
 * Blog Management Page Component
 * 
 * This component provides an administrative interface for managing blog posts.
 * It allows administrators to:
 * - View all blog posts in a table format
 * - Toggle post publication status
 * - Delete posts
 * - Navigate to create new posts or edit existing ones
 * 
 * The component fetches posts on mount and provides real-time updates when
 * post status changes or posts are deleted.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * Interface defining the structure of a blog post
 */
interface Post {
  id: string;          // Unique identifier for the post
  title: string;       // Post title
  slug: string;        // URL-friendly version of the title
  author_name: string; // Name of the post author
  is_published: boolean; // Publication status
  created_at: string;  // Creation timestamp
  image_url: string | null; // Optional featured image URL
}

export default function BlogManagementPage() {
  // State management for posts, loading state, and error handling
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);

  // Fetch posts when component mounts or page changes
  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  /**
   * Fetches all blog posts from the API
   * Updates the posts state and handles any errors that occur
   */
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/blog?page=${currentPage}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data.posts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggles the publication status of a blog post
   * @param id - The ID of the post to update
   * @param isPublished - Current publication status
   */
  const handlePublishToggle = async (id: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_published: !isPublished,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update post status');
      }

      // Refresh the posts list to show updated status
      fetchPosts();
    } catch (err) {
      console.error('Error updating post status:', err);
      setError('Failed to update post status');
    }
  };

  /**
   * Deletes a blog post after user confirmation
   * @param id - The ID of the post to delete
   */
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      // Refresh the posts list to remove deleted post
      fetchPosts();
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post');
    }
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="min-h-screen py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="min-h-screen py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="min-h-screen py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header section with title and new post button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900">Blog Posts</h1>
          <Link
            href="/admin/blog/new"
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            New Post
          </Link>
        </div>

        {/* Posts table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/blog/edit/${post.id}`}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Edit
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      <div className="text-sm text-gray-500">{post.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handlePublishToggle(post.id, post.is_published)}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          post.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {post.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.is_published ? new Date(post.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.author_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Pagination Controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} posts
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
} 