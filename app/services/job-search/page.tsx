import Link from 'next/link';

const checkIcon = (
  <svg className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const benefits = [
  { title: '4 sessions, 2-coach support system', description: 'Focused one-on-one sessions to move your job search forward.' },
  { title: 'Resume and LinkedIn review', description: 'Polished materials that showcase your strengths.' },
  { title: 'Custom action plan', description: 'A tailored roadmap for your search and applications.' },
  { title: 'Interview prep', description: 'Practice and strategy so you show up confident.' },
  { title: 'Goal alignment strategy', description: 'Clarity on what you want and how to get there.' },
];

export default function JobSearch() {
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

        <section className="text-center mb-16" aria-labelledby="job-search-heading">
          <h1 id="job-search-heading" className="text-4xl font-bold mb-4 text-purple-900 tracking-tight">Job Search Support</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get structured support to land your next role: targeted strategy, materials optimisation, and interview prep.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-12">
          {/* What You'll Get */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-purple-900 mb-3">What You'll Get</h2>
              <p className="text-gray-600 mb-2">
                A focused 4-session package designed to accelerate your job search and build confidence.
              </p>
              <p className="text-2xl font-bold text-purple-900 mb-6">$395</p>
            </div>

            <div className="space-y-6">
              <div>
                <div className="space-y-3">
                  {benefits.map((item) => (
                    <div key={item.title} className="flex items-start">
                      {checkIcon}
                      <div>
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Schedule an Info Session */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-purple-900 mb-3">Schedule an Info Session</h2>
              <p className="text-gray-600 mb-6">
                Book a free intro call to learn how we can support your job search and see if this package is right for you.
              </p>
            </div>

            <a
              href="https://zcal.co/t/elevateher/introduction"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl hover:bg-purple-700"
            >
              Book Your Free Intro Call
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
