'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { workshopWaitlistSchema } from '@/lib/validation/base';

export default function WaitlistForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mailingList: false,
    category: 'workshops',
    website: '', // Honeypot field
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const validationResult = workshopWaitlistSchema.safeParse(formData);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => err.message);
        setError(errors.join(', '));
        return;
      }

      const response = await fetch('/api/submit-workshop-waitlist', {
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
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Your Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"
          placeholder="your.email@example.com"
        />
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
        className={`w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
        }`}
      >
        {isSubmitting ? 'Joining Waitlist...' : 'Join Waitlist'}
      </button>
    </form>
  );
}

