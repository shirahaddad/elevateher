import Link from 'next/link';

export default function CareerClarityWorkshopPage() {
  const upcomingZoomUrl =
    'https://us04web.zoom.us/meeting/register/tQAnSOfATjeU8TukthCA7A';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-8 py-16">
        <Link
          href="/services/workshops"
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
          Back to Workshops
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M12 3l2.6 5.2L20 10.8l-5.4 2.6L12 19l-2.6-5.6L4 10.8l5.4-2.6L12 3z" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-purple-900 mb-2">Career Clarity: Empowering Your Next Chapter</h1>
            <p className="text-gray-600">
              January 15th, 2026 at 5:00 PM ET
            </p>
          </div>

          <div className="space-y-6 text-gray-700">
            <p>
              Designed for those navigating growth, change, or uncertainty in their professional lives. Whether you’re stepping into leadership, questioning what’s next, or seeking alignment, this session will help you:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Identify what’s holding you back and where your opportunities truly are</li>
              <li>Start defining a vision for your next chapter</li>
              <li>Gain practical tools to move from uncertainty to intention</li>
              <li>Connect with a community of individuals on the same journey</li>
            </ul>
            <p>
              This workshop isn’t about fixing you. It’s about creating space to listen to yourself and leaving with practical insights you can build on throughout the year.
            </p>
            <p className="text-purple-900 font-semibold">
              Your next chapter is calling. Let’s begin it together.
            </p>
          </div>

          <div className="mt-8">
            <a
              href={upcomingZoomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl hover:bg-purple-700"
            >
              Register on Zoom
            </a>
            <p className="text-xs text-gray-500 text-center mt-2">
              You’ll be taken to Zoom to complete your registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


