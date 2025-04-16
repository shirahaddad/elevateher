'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LearnMoreForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/submit-learn-more', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      router.push('/thank-you');
    } catch (err) {
      setError('There was an error submitting your form. Please try again.');
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="min-h-screen py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6 text-purple-900 tracking-tight">Learn More</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fill out your name and email and we'll reach out with more details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-2xl shadow-xl p-8">
          
          <div>
            <label 
                htmlFor="name"
                className='block text-sm font-medium text-gray-700 mb-1'
            >
            What's your name?
            </label>
            <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"        
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              What&apos;s your email?
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm mt-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors shadow-lg hover:shadow-xl ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LearnMore() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LearnMoreForm />
    </Suspense>
  );
} 