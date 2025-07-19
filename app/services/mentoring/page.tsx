'use client';

import Image from 'next/image';
import Link from 'next/link';

const mentoringOptions = [
  {
    name: 'Individual Session',
    image: '/images/single-session.png',
    sessions: '1 Session',
    title: 'Get Started with Mentoring',
    price: '$250',
    details: {
      bestFor: 'Women who want to try mentoring or have a specific challenge they need guidance on.',
      included: [
        '🌱 1 one-on-one mentoring session (60 minutes)',
        '📊 Goal clarification and action planning',
        '📝 Personalized advice and recommendations',
        '🎯 Next steps and resource sharing',
        '💬 Follow-up summary with key takeaways'
      ],
      outcome: 'Clear direction and actionable steps to move forward in your career.'
    }
  },
  {
    name: '10-Session Series',
    image: '/images/series.png',
    sessions: '10 Sessions',
    title: 'Comprehensive Mentoring Journey',
    price: '$2,000',
    details: {
      bestFor: 'Women committed to sustained growth and development over 3-6 months.',
      included: [
        '🌱 10 one-on-one mentoring sessions (60 minutes each)',
        '📊 Ongoing goal tracking and progress reviews',
        '📝 Skills development and confidence building',
        '🎯 Career strategy and opportunity identification',
        '📈 Regular check-ins and course corrections',
        '💬 Ongoing support between sessions via email'
      ],
      outcome: 'Significant professional growth, enhanced skills, and clear career momentum.'
    }
  },
  {
    name: 'L&D Budget Option',
    image: '/images/l-n-d.png',
    sessions: 'Custom',
    title: 'Tailored Corporate Program',
    price: 'Custom Quote',
    details: {
      bestFor: 'Organizations looking to invest in their employees\' development and growth.',
      included: [
        '🌱 Customized mentoring program design',
        '📊 Flexible session structure based on budget',
        '📝 Group or individual mentoring options',
        '🎯 Progress tracking and reporting',
        '📈 Integration with existing L&D initiatives',
        '💬 Dedicated account management and support'
      ],
      outcome: 'Improved employee retention, satisfaction, and leadership pipeline development.'
    }
  }
];

export default function Mentoring() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-16">
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
          <h1 className="text-4xl font-bold mb-6 text-purple-900 tracking-tight">Mentoring</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Grow in your role with honest advice, confidence-building, and practical skill development
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mentoringOptions.map((option, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-48">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-50 opacity-90" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={option.image}
                    alt={option.name}
                    fill
                    className="opacity-80 object-cover object-center"
                  />
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-purple-900 mb-1">{option.name}</h3>
                <div className="text-base font-semibold text-purple-700 mb-1">{option.sessions}</div>
                <div className="text-lg font-bold text-purple-800 mb-2">{option.title}</div>
                <div className="text-xl font-bold text-purple-900 mb-6">{option.price}</div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-2">Best for:</h4>
                    <p className="text-gray-700 text-sm">{option.details.bestFor}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-2">What's Included:</h4>
                    <ul className="list-none text-gray-700 text-sm space-y-1">
                      {option.details.included.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-2">Outcome:</h4>
                    <p className="text-gray-700 text-sm">{option.details.outcome}</p>
                  </div>
                </div>

                <div className="mt-8">
                  {option.name === 'L&D Budget Option' ? (
                    <Link 
                      href="/learn-more"
                      className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg text-center font-semibold hover:bg-purple-700 transition-colors block"
                    >
                      Contact Us
                    </Link>
                  ) : (
                    <Link 
                      href={`/questionnaire?source=${option.name.toLowerCase().replace(' ', '-')}`}
                      className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg text-center font-semibold hover:bg-purple-700 transition-colors block"
                    >
                      Start with {option.name}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 