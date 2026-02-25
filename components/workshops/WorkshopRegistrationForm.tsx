'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { workshopRegistrationSchema } from '@/lib/validation/base';

type Props = {
  workshopSlug: string;
  workshopTitle?: string;
};

export default function WorkshopRegistrationForm({ workshopSlug, workshopTitle }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mailingList: false,
    website: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = { ...formData, workshopSlug };
      const validationResult = workshopRegistrationSchema.safeParse(payload);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map((err) => err.message);
        setError(errors.join(', '));
        return;
      }

      const response = await fetch('/api/workshop-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 409 && data.error === 'already_registered') {
        setError("You're already registered for this workshop.");
        return;
      }

      if (!response.ok) {
        setError(data.message || 'Registration failed. Please try again.');
        return;
      }

      router.push('/thank-you?source=workshop-registration');
    } catch (err) {
      setError('Registration failed. Please try again.');
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
      setFormData((prev) => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      aria-label={workshopTitle ? `Register for ${workshopTitle}` : 'Register for this workshop'}
      noValidate
    >
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
        <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 mb-1">
          Your Name
        </label>
        <input
          type="text"
          id="reg-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="reg-email"
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
          id="reg-mailingList"
          name="mailingList"
          checked={formData.mailingList}
          onChange={handleChange}
          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
        />
        <label htmlFor="reg-mailingList" className="ml-2 text-sm text-gray-700 cursor-pointer">
          Add me to your mailing list.
        </label>
      </div>

      {error && (
        <div id="reg-error" className="text-red-600 text-sm mt-2" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
        }`}
        aria-describedby={error ? 'reg-error' : undefined}
      >
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
