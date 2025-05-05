'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react";
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/admin');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        router.push('/admin');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen py-16 bg-white">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900">Admin Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl shadow-xl p-8 text-black">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Login
          </button>
        </form>
        <div className="mt-8 flex flex-col items-center">
          <span className="text-gray-500 mb-2">or</span>
          <button
            onClick={() => signIn('google')}
            className="w-full bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mt-2"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
} 