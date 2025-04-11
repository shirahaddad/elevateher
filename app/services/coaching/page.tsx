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
      bestFor: 'Women exploring a new leadership path or preparing for a role change who want targeted support and momentum.',
      included: [
        '3 one-on-one coaching sessions',
        'Strengths-based assessment & leadership style evaluation',
        'Resume review + custom action plan',
        'Interview prep or goal alignment strategy',
        '1 asynchronous support exchange between sessions (voice/text/email)'
      ],
      outcome: 'Clarity on your leadership identity and next steps toward an aligned role.'
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
        '6 one-on-one coaching sessions',
        'Full leadership style & career clarity assessment',
        'Resume + LinkedIn alignment session',
        'Behavioral interview prep & storytelling practice',
        'Goal tracking & weekly action items',
        '3 asynchronous support exchanges between sessions (voice/text/email)'
      ],
      outcome: 'Confidence, strategy, and assets in place to lead boldly or land the role that\'s meant for you.'
    }
  },
  {
    name: 'Command Line',
    image: '/images/commandline.png',
    sessions: '9 Sessions',
    title: 'Full System Upgrade',
    price: '$2295',
    details: {
      bestFor: 'Women in tech ready for major growth, role transitions, or defining their personal brand.',
      included: [
        '9 one-on-one coaching sessions',
        'In-depth leadership identity & mindset framework',
        'Resume, LinkedIn, & personal brand overhaul',
        'Mock interviews, presentations, or stakeholder conversation feedback',
        'Personalized career strategy map',
        'Unlimited asynchronous support between sessions (voice/text/email)'
      ],
      outcome: 'Executive-level clarity, communication, and presence—ready for whatever\'s next.'
    }
  }
];

export default function Coaching() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6 text-purple-900 tracking-tight">Individual Coaching</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Personalized guidance for your career growth and leadership journey
          </p>
        </div>

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

                    className="opacity-80"
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
                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                      {item.details.included.map((point, idx) => (
                        <li key={idx}>{point}</li>
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
                    href={`/questionnaire?source=${item.name.toLowerCase()}`}
                    className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg text-center font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Start with {item.name}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 