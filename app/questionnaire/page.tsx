'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function QuestionnaireForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    goals: '',
    skills: [] as string[],
    otherSkill: '',
    timeCommitment: '',
    linkedin: '',
    additionalInfo: '',
    mailingList: false,
    source: searchParams.get('source') || '',
  });

  const skillsOptions = [
    'Collaboration',
    'Leadership Style',
    'Conflict Management',
    'Develop High Performing Team',
    'Productivity',
    'Delegation',
    'People Management',
    'Technical Proficiency',
    'Adaptability',
    'Emotional Intelligence',
    'Communication',
    'Managing Up/Sideways',
    'Providing/recieving feedback',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/submit-questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      router.push('/questionnaire/thank-you');
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

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const newSkills = checked
        ? [...prev.skills, value]
        : prev.skills.filter((skill) => skill !== value);
      return {
        ...prev,
        skills: newSkills,
        otherSkill: value === 'Other' && !checked ? '' : prev.otherSkill,
      };
    });
  };

  return (
    <div className="min-h-screen py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6 text-purple-900 tracking-tight">Start Your Journey</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We&apos;re excited to learn more about you and your goals. Fill out the form below and we&apos;ll get back to you soon.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-2xl shadow-xl p-8">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              What&apos;s your email? *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label
              htmlFor="goals"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              What would you like to get out of working with a coach? *
            </label>
            <textarea
              id="goals"
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What skills are you most interested in developing? Choose at least 3, no more than 7. *
            </label>
            <div className="space-y-2">
              {skillsOptions.map((skill) => (
                <div key={skill} className="flex items-center">
                  <input
                    type="checkbox"
                    id={skill}
                    name="skills"
                    value={skill}
                    checked={formData.skills.includes(skill)}
                    onChange={handleSkillsChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor={skill} className="ml-2 text-sm text-gray-700">
                    {skill}
                  </label>
                </div>
              ))}
              {formData.skills.includes('Other') && (
                <div className="ml-6 mt-2">
                  <input
                    type="text"
                    value={formData.otherSkill}
                    onChange={(e) => setFormData(prev => ({ ...prev, otherSkill: e.target.value }))}
                    placeholder="Please specify"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="timeCommitment"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Are you able to commit at least an hour a week to activities related to your coaching sessions? *
            </label>
            <select
              id="timeCommitment"
              name="timeCommitment"
              value={formData.timeCommitment}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"
            >
              <option value="">Select an option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="maybe">Maybe</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="linkedin"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Please share your LinkedIn profile:
            </label>
            <input
              type="url"
              id="linkedin"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"
            />
          </div>

          <div>
            <label
              htmlFor="additionalInfo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Anything else you&apos;d like to tell us?
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"
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
            <label htmlFor="mailingList" className="ml-2 text-sm text-gray-700">
              Sure, add me to your mailing list.
            </label>
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

export default function Questionnaire() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuestionnaireForm />
    </Suspense>
  );
} 