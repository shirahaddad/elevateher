'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { workshopWaitlistSchema } from '@/lib/validation/base';

export default function Workshops() {
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
  const upcomingZoomUrl =
    'https://example.zoom.us/meeting/register/your-link';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Client-side validation
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
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-16">
        <Link 
          href="/services" 
          className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 transition-colors mb-8 text-sm font-medium"
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Services
        </Link>
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6 text-purple-900 tracking-tight">Workshops</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Interactive sessions to enhance your leadership skills and career development. Choose the option that works best for you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Section 1: Upcoming Workshop with Zoom Registration */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <svg className="w-10 h-10 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M12 3l2.6 5.2L20 10.8l-5.4 2.6L12 19l-2.6-5.6L4 10.8l5.4-2.6L12 3z" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-purple-900 mb-2 line-clamp-3 leading-snug">Career Clarity: Empowering Your Next Chapter</h2>
              <p className="text-gray-600 mb-6">
                Join our next live workshop, on January 15th, 2026 at 5:00 PM ET.
              </p>
            </div>
            <div className="space-y-4">
              <Link
                href="/services/workshops/career-clarity"
                className="block w-full text-center bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl hover:bg-purple-700"
              >
                Learn more
              </Link>
              <p className="text-xs text-gray-500 text-center">
                Learn more about the session details and register.
              </p>
            </div>
          </div>

          {/* Section 2: Show Interest in Future Workshops (Short Form) */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-purple-900 mb-3">Show Interest in Future Workshops</h2>
              <p className="text-gray-600 mb-6">
                Share your interest below and we'll notify you when dates of our next workshops are announced.
              </p>
            </div>

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
          </div>

          {/* Section 3: Invite ElevateHer to Your Organization */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 8h10M7 12h4m1 8l-1-1h1m-1 1h1" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-purple-900 mb-3">Invite Elevate(Her) to Your Organization</h2>
              <p className="text-gray-600 mb-6">
                Bring our workshops to your team. We offer customized sessions for organizations of all sizes.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Workshop Topics Include:</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-2 text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Leadership
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Communication
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Team Management
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Collaboration
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Conflict Resolution
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Feedback
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Emotional Intelligence
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Adaptability
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Personal Branding
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Career Advancement
                  </div>
                </div>
              </div>



              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  Interested in bringing these workshops to your organization?
                </p>
                <p className="text-gray-600">
                  Contact us at <a href="mailto:info@elevateher.tech" className="text-purple-600 hover:text-purple-700 underline">info@elevateher.tech</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 