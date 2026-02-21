'use client';

import Image from 'next/image';
import Link from 'next/link';

const series = [
  {
    name: 'Bootstrap',
    image: '/images/bootstrap.png',
    sessions: '3 Sessions',
    title: 'Foundation for Lift-Off',
    price: '$795',
    details: {
      bestFor: 'Women who want clarity on their career direction - whether leveling up in your current workplace or exploring what\'s next.',
      included: [
        '🌱 3 one-on-one coaching sessions',
        '📊 Strengths-based assessment & leadership style evaluation',
        '📝 Goal alignment & custom action plan',
        '🎯 Clarity on next steps (in role or beyond)',
        '💬 Asynchronous support between sessions (community/email)'
      ],
      outcome: 'Clarity on your professional identity and next steps toward an aligned direction.'
    }
  },
  {
    name: 'Configuration',
    image: '/images/configuration.png',
    sessions: '6 Sessions',
    title: 'Build. Align. Activate.',
    price: '$1495',
    details: {
      bestFor: 'Women stepping into a new leadership role or looking to level up with confidence and strategic direction.',
      included: [
        '🌱 6 one-on-one coaching sessions',
        '📊 Leadership style & career clarity assessment',
        '📝 Career narrative & alignment session',
        '🎯 Storytelling and strategic communication practice',
        '📈 Goal tracking & weekly action items',
        '💬 Asynchronous support exchanges between sessions (community/email)'
      ],
      outcome: 'Confidence, strategy, and clarity in place to lead boldly and move toward what\'s meant for you.'
    }
  },
  {
    name: 'Command Line',
    image: '/images/commandline.png',
    sessions: '9 Sessions',
    title: 'Full System Upgrade',
    price: '$2295',
    details: {
      bestFor: 'Women in tech who are ready for a major career transition and want to reassess their skills, refine their personal brand, and intentionally reshape their professional identity.',
      included: [
        '🌱 9 one-on-one coaching sessions',
        '📊 In-depth leadership identity & mindset framework',
        '📝 Personal brand and narrative clarity',
        '🎯 Presentations and high-stakes conversation feedback',
        '📈 Personalized career strategy map',
        '📋 Goal tracking & weekly action items',
        '💬 Asynchronous support between sessions (community/email)'
      ],
      outcome: 'Executive-level clarity, communication, and presence.'
    }
  }
];

export default function CareerClarity() {
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
        
        <section className="text-center mb-16" aria-labelledby="career-clarity-heading">
          <h1 id="career-clarity-heading" className="text-4xl font-bold mb-4 text-purple-900 tracking-tight">Career Clarity</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Personalized coaching that blends reflection, strategic guidance, and accountability to support clarity in your career.
          </p>
        </section>

        <section aria-labelledby="packages-heading">
          <h2 id="packages-heading" className="sr-only">Coaching packages</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {series.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-48">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-50 opacity-90" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="opacity-80 object-cover object-center"
                  />
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-purple-900 mb-1">{item.name}</h3>
                <div className="text-base font-semibold text-purple-700 mb-1">{item.sessions}</div>
                <div className="text-lg font-bold text-purple-800 mb-2">{item.title}</div>
                <div className="text-xl font-bold text-purple-900 mb-6">{item.price}</div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-2">Best for:</h4>
                    <p className="text-gray-700 text-sm">{item.details.bestFor}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-2">What's Included:</h4>
                    <ul className="list-none text-gray-700 text-sm space-y-1">
                      {item.details.included.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-2">Outcome:</h4>
                    <p className="text-gray-700 text-sm">{item.details.outcome}</p>
                  </div>
                </div>

                <div className="mt-8">
                  <Link 
                    href="/learn-more"
                    className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg text-center font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Start with {item.name}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        </section>
      </div>
    </div>
  );
}
