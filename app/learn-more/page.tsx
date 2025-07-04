'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { learnMoreFormSchema } from '@/lib/validation/base';

function LearnMoreForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mailingList: false,
    website: '', // Honeypot field disguised as a website field
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Client-side validation
      const validationResult = learnMoreFormSchema.safeParse(formData);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => err.message);
        setError(errors.join(', '));
        return;
      }

      const response = await fetch('/api/submit-learn-more', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit form');
      }

      router.push('/thank-you');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'There was an error submitting your form. Please try again.');
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
      {/* Skip link for keyboard users */}
      <a 
        href="#learn-more-form" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to form
      </a>
      
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6 text-purple-900 tracking-tight">Learn More</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fill out your name and email and we'll reach out with more details.
          </p>
        </div>

        <form id="learn-more-form" onSubmit={handleSubmit} className="space-y-8 bg-white rounded-2xl shadow-xl p-8">
          {/* Honeypot field - hidden from users */}
          <div style={{ display: 'none' }}>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          
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
                autoFocus
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"        
                aria-describedby="name-help"
            />
            <p id="name-help" className="text-sm text-gray-500 mt-1">
              Enter your full name
            </p>
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
              aria-describedby="email-help"
            />
            <p id="email-help" className="text-sm text-gray-500 mt-1">
              We'll use this to contact you
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="mailingList"
              name="mailingList"
              checked={formData.mailingList}
              onChange={handleChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="mailingList" className="ml-2 text-sm text-gray-700 cursor-pointer">
              Sure, add me to your mailing list.
            </label>
          </div>

          {error && (
            <div className="text-red-600 text-sm mt-2" role="alert" aria-live="polite">
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