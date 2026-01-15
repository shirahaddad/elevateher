import Link from 'next/link';

interface ServicesPageProps {
  searchParams: Promise<{ filter?: string }>
}

export default async function Services({ searchParams }: ServicesPageProps) {
  const params = await searchParams;
  const filter = params?.filter;
  const isIndividualFilter = filter === 'individual';
  const isPackagesFilter = filter === 'packages';

  // Define which services to show based on filter
  const shouldShowService = (serviceName: string) => {
    // Individual services filter
    if (isIndividualFilter) {
      const individualServices = ['career-advising', 'mentoring', 'exec-coaching'];
      return individualServices.includes(serviceName);
    }
    // Packages filter: only show Career Advising and Mentoring
    if (isPackagesFilter) {
      const packageServices = ['career-advising', 'mentoring'];
      return packageServices.includes(serviceName);
    }
    // Default: show all services
    return true;
  };

  return (
    <div 
      className="min-h-screen bg-white relative"
      style={{
        backgroundImage: 'url("/images/hero-background.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-white/70" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 relative">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-purple-900 tracking-tight">
            {isIndividualFilter ? '1 on 1 Coaching Services' : isPackagesFilter ? 'Coaching Packages' : 'Our Services'}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Book your <a href="https://zcal.co/t/elevateher/introduction" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 underline">first free session</a> with us and see how we can support your career growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Career Advising */}
          {shouldShowService('career-advising') && (
            <Link href="/services/career-advising" className="block">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 transform hover:scale-105 transition-transform duration-300">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-purple-900">Career Advising</h2>
                <ul className="space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base">
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Define your goals
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Career Roadmapping and strategy
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Tailored series plan
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    2-coach support system
                  </li>
                </ul>
              </div>
            </Link>
          )}

          {/* Mentoring */}
          {shouldShowService('mentoring') && (
            <Link href="/services/mentoring" className="block">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 transform hover:scale-105 transition-transform duration-300">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-purple-900">Mentoring</h2>
                <ul className="space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base">
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Build confidence and skills
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Get honest, practical advice
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Grow in your current role
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    2-coach support system
                  </li>
                </ul>
              </div>
            </Link>
          )}

          {/* Workshops */}
          {shouldShowService('workshops') && (
            <Link href="/services/workshops" className="block">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 transform hover:scale-105 transition-transform duration-300">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-purple-900">Workshops</h2>
                <ul className="space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base">
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Interactive, skill-building sessions
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Leadership, communication skills
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Strategic thinking
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Designed for real impact
                  </li>
                </ul>
              </div>
            </Link>
          )}

          {/* Community */}
          {shouldShowService('community') && (
            <Link href="/services/community" className="block">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 transform hover:scale-105 transition-transform duration-300">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-purple-900">Community</h2>
                <ul className="space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base">
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Peer mentoring circles
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Networking events
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Support groups
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Online community access
                  </li>
                </ul>
              </div>
            </Link>
          )}

          {/* Executive Coaching */}
          {shouldShowService('exec-coaching') && (
            <Link href="/services/exec-coaching" className="block">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 transform hover:scale-105 transition-transform duration-300">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-purple-900">Executive Coaching</h2>
                <ul className="space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base">
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Get deep and transformational
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Clarify mindset and presence
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Make thoughtful decisions
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Professional, high-trust coaching
                  </li>
                </ul>
              </div>
            </Link>
          )}
        </div>

        {/* Not sure what you need section */}
        <div className="text-center mt-12 sm:mt-16">
          <p className="text-lg sm:text-xl text-gray-700 mb-4">
            If you're not sure what you need - schedule a free 30-minute intro call <a 
              href="https://zcal.co/t/elevateher/introduction" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-purple-600 hover:text-purple-800 underline"
            >
              here
            </a>.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Explore your goals, learn what's possible, and get a tailored recommendation.
          </p>
        </div>


      </div>
    </div>
  );
} 